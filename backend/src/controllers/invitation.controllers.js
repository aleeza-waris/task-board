import crypto from "crypto";

import Invitation from "../models/invitation.model.js";
import Workspace from "../models/workspace.model.js";
import WorkspaceMember from "../models/workspaceMember.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import transporter from "../utils/mailer.js";
import mongoose from "mongoose";

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

export const sendWorkspaceInvitation = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    // Validate the email.
    if (!email || typeof email !== "string") {
      throw new ApiError(400, "Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    // Verify that the workspace exists.
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    // Only workspace admins can send invitations.
    const adminMembership = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.user.userId,
      role: "admin",
    });

    if (!adminMembership) {
      throw new ApiError(
        403,
        "Only workspace admins can invite members"
      );
    }

    // Check whether the email already belongs to a workspace member.
    const invitedUser = await User.findOne({ email: normalizedEmail });

    if (invitedUser) {
      const existingMembership = await WorkspaceMember.findOne({
        workspaceId,
        userId: invitedUser._id,
      });

      if (existingMembership) {
        throw new ApiError(
          409,
          "This user is already a workspace member"
        );
      }
    }

    // Check for an existing pending invitation.
    const existingInvitation = await Invitation.findOne({
      workspaceId,
      email: normalizedEmail,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      throw new ApiError(
        409,
        "A pending invitation already exists for this email"
      );
    }

    // Generate a secure token; store only its hash.
    const token = crypto.randomBytes(32).toString("hex");

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const invitationUrl =
  `${frontendUrl.replace(/\/+$/, "")}/accept-invitation?token=${token}`;

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Invitation expires after 7 days.
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const invitation = await Invitation.create({
      workspaceId,
      email: normalizedEmail,
      invitedBy: req.user.userId,
      tokenHash,
      expiresAt,
    });

    /* to send email, we use the transporter object from the mailer utility.
     The email contains the invitation link and instructions for the
     recipient to accept the invitation. If sending the email fails,
      we delete the created invitation to maintain data integrity and
      throw an error to inform the user of the failure. */
try {
  const escapedWorkspaceName = escapeHtml(workspace.name);
  const escapedInvitationUrl = escapeHtml(invitationUrl);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: normalizedEmail,
    subject: `Invitation to join ${workspace.name}`,
    text: `You have been invited to join the workspace "${workspace.name}" on Task Board.

Accept your invitation using this link:
${invitationUrl}

This invitation expires in 7 days.`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Task Board workspace invitation</title>
  </head>
  <body style="margin:0; padding:24px 12px; background-color:#f4f7f7; color:#172b2a; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #dce7e6; border-radius:12px;">
      <tr>
        <td style="padding:28px 32px; background-color:#123b3a; border-radius:12px 12px 0 0;">
          <p style="margin:0; color:#ffffff; font-size:20px; font-weight:700;">Task Board</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 16px; color:#123b3a; font-size:24px; line-height:1.3;">You are invited</h1>
          <p style="margin:0 0 12px; font-size:16px; line-height:1.6;">You have been invited to join the workspace <strong>${escapedWorkspaceName}</strong> on Task Board.</p>
          <p style="margin:0 0 24px; color:#526260; font-size:15px; line-height:1.6;">Accept the invitation to join your team and get started.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="border-radius:8px; background-color:#0f766e;">
                <a href="${escapedInvitationUrl}" style="display:inline-block; padding:13px 22px; border:1px solid #0f766e; border-radius:8px; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none;">Accept Invitation</a>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 8px; color:#526260; font-size:13px; line-height:1.6;">This invitation expires in 7 days.</p>
          <p style="margin:0; color:#71807e; font-size:12px; line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${escapedInvitationUrl}" style="color:#0f766e; word-break:break-all;">${escapedInvitationUrl}</a></p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
} catch (emailError) {
  await Invitation.findByIdAndDelete(invitation._id);
  throw new ApiError(502, "Failed to send invitation email. Please try again.");
}

    return res.status(201).json({
      success: true,
      message: "Invitation created successfully",
      data: {
        invitationId: invitation._id,
        email: invitation.email,
        workspaceName: workspace.name,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listWorkspaceInvitations = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const invitations = await Invitation.find({ workspaceId })
      .select("email invitedBy createdAt expiresAt acceptedAt revokedAt")
      .sort({ createdAt: -1 });
    const now = new Date();

    return res.status(200).json({
      success: true,
      data: invitations.map((invitation) => ({
        ...invitation.toObject(),
        status: invitation.revokedAt
          ? "revoked"
          : invitation.acceptedAt
            ? "accepted"
            : invitation.expiresAt <= now
              ? "expired"
              : "pending",
      })),
    });
  } catch (error) {
    next(error);
  }
};

// for accepting the invitation,
 export const acceptWorkspaceInvitation = async (req, res, next) => {
 const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { token } = req.body;

    if (!token || typeof token !== "string") {
      throw new ApiError(400, "Invitation token is required");
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");


    const invitation = await Invitation.findOne({ tokenHash }).session(session);

    if (!invitation) {
      throw new ApiError(404, "Invalid invitation token");
    }

    if (invitation.revokedAt) {
      throw new ApiError(410, "This invitation has been revoked");
    }

    if (invitation.acceptedAt) {
      throw new ApiError(409, "This invitation has already been accepted");
    }

    if (invitation.expiresAt <= new Date()) {
      throw new ApiError(410, "This invitation has expired");
    }


    const user = await User.findById(req.user.userId).session(session);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const normalizedUserEmail = user.email?.trim().toLowerCase();
    const normalizedInvitationEmail = invitation.email?.trim().toLowerCase();

    if (normalizedUserEmail !== normalizedInvitationEmail) {
      throw new ApiError(
        403,
        "This invitation was sent to a different email address. Please sign in with the invited email."
      );
    }


    const claimedInvitation = await Invitation.findOneAndUpdate(
      {
        _id: invitation._id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      },
      {
        $set: { acceptedAt: new Date() },
      },
      { new: true,session }
    );

    if (!claimedInvitation) {
      throw new ApiError(
        409,
        "This invitation is no longer available"
      );
    }

 await WorkspaceMember.create(
  [{
    workspaceId: invitation.workspaceId,
    userId: user._id,
    role: "member",
  }],
  { session }
);
    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: {
        workspaceId: invitation.workspaceId,
        userId: user._id,
        role: "member",
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction(); // rollback the transaction if any error occurs
      } catch (abortError) {
        console.error("Failed to abort invitation transaction:", abortError);
      }
    }

    next(error);
  } finally {
    await session.endSession();  // releases the database session whether the request succeeds or fails
  }

};

export const revokeWorkspaceInvitation = async (req, res, next) => {
try {
const { workspaceId, invitationId } = req.params;


const invitation = await Invitation.findOne({
  _id: invitationId,
  workspaceId,
});

if (!invitation) {
  throw new ApiError(404, "Invitation not found");
}

if (invitation.acceptedAt) {
  throw new ApiError(409, "This invitation has already been accepted");
}

if (invitation.revokedAt) {
  throw new ApiError(409, "This invitation has already been revoked");
}

invitation.revokedAt = new Date();
await invitation.save();

return res.status(200).json({
  success: true,
  message: "Invitation revoked successfully",
});

} catch (error) {
next(error);
}
};
