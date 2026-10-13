import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { registerSchema } from "../schemas/auth.schema.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { loginSchema } from "../schemas/auth.schema.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// registering new user
const registerUser = async (req, res, next) => {
  try {
    // 1. Check required fields
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues[0].message
      );
    }

    const { username, email, password } = validationResult.data;

    console.log(`Registering user: ${username}, email: ${email}`);
    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    console.log(existingUser, "existing user");
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Upload avatar to Cloudinary if provided
    let avatarUrl = "";
    let avatarPublicId = "";

    if (req.file) {
      const uploadedAvatar = await uploadOnCloudinary(req.file.buffer);

      avatarUrl = uploadedAvatar.secure_url;
      avatarPublicId = uploadedAvatar.public_id;
    }

    // 5. Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
      avatarPublicId,
    });

    // 6. Return response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// login user
const loginUser = async (req, res, next) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ApiError(
        400,
        validationResult.error.issues[0].message
      );
    }

    const { email, password } = validationResult.data;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// refresh token
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// google authentication
const googleAuth = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      throw new ApiError(
        400,
        "Google authorization code is required"
      );
    }

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:7000/api/auth/google/callback"
    );

    // Exchange Google's authorization code for tokens
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw new ApiError(
        401,
        "Google ID token was not received"
      );
    }

    // Verify Google's ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new ApiError(401, "Invalid Google token");
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    if (!googleId || !email) {
      throw new ApiError(
        400,
        "Google account information is incomplete"
      );
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.googleId = googleId;

        if (!user.avatar && picture) {
          user.avatar = picture;
        }

        await user.save();
      } else {
        user = await User.create({
          username: name || email.split("@")[0],
          email,
          password: `google_${googleId}`,
          googleId,
          avatar: picture || "",
        });
      }
    }

    if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const defaultFrontendOrigin =
      process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://task-board-delta-amber.vercel.app"
        : "http://localhost:3000");
    const allowedFrontendOrigins = new Set([
      "http://localhost:3000",
      "https://task-board-delta-amber.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean));
    let frontendOrigin = defaultFrontendOrigin;
    let returnTo;

    if (typeof req.query.state === "string") {
      let state;
      try {
        state = jwt.verify(req.query.state, process.env.JWT_SECRET);
      } catch {
        throw new ApiError(400, "Invalid Google login state");
      }

      if (
        state &&
        typeof state === "object" &&
        typeof state.frontendOrigin === "string" &&
        allowedFrontendOrigins.has(state.frontendOrigin)
      ) {
        frontendOrigin = state.frontendOrigin;
        if (
          typeof state.returnTo === "string" &&
          state.returnTo.startsWith("/") &&
          !state.returnTo.startsWith("//") &&
          !state.returnTo.includes("\\")
        ) {
          returnTo = state.returnTo;
        }
      }
    }

    const frontendCallbackUrl = new URL("/login/google", frontendOrigin);
    if (returnTo) frontendCallbackUrl.searchParams.set("returnTo", returnTo);
    res.redirect(frontendCallbackUrl.toString());
  } catch (error) {
    next(error);
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  googleAuth,
};
