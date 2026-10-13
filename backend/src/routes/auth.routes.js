import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";

import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:7000/api/auth/google/callback";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl
);

router.post(
  "/register",
  upload.single("avatar"),
  registerUser
);

router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
// Start Google login
router.get("/google/login", (req, res) => {
  const allowedFrontendOrigins = new Set(
    [
      "http://localhost:3000",
      "https://task-board-delta-amber.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
  );
  const requestedOrigin = req.query.frontendOrigin;
  const frontendOrigin =
    typeof requestedOrigin === "string" &&
    allowedFrontendOrigins.has(requestedOrigin)
      ? requestedOrigin
      : process.env.FRONTEND_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://task-board-delta-amber.vercel.app"
          : "http://localhost:3000");

  const requestedReturnTo = req.query.returnTo;
  const returnTo =
    typeof requestedReturnTo === "string" &&
    requestedReturnTo.startsWith("/") &&
    !requestedReturnTo.startsWith("//") &&
    !requestedReturnTo.includes("\\")
      ? requestedReturnTo
      : undefined;
  const state = jwt.sign(
    { frontendOrigin, returnTo },
    process.env.JWT_SECRET,
    { expiresIn: "10m" },
  );

  const authorizationUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "profile", "email"],
    state,
  });

  res.redirect(authorizationUrl);
});

// Google callback
router.get("/google/callback", googleAuth);

export default router;
