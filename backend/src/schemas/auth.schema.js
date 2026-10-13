import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),

  email: z
    .string()
    .email("Please provide a valid email")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required"),
});