import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "Access token has expired"));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, "Invalid authentication token"));
    }

    next(error);
  }
};

export default authMiddleware;