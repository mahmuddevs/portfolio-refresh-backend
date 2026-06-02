import { z } from "zod";

export const UserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(3, "First Name must be at least 3 characters long"),
  lastName: z
    .string()
    .trim()
    .min(3, "Last Name must be at least 3 characters long"),
  email: z
    .string()
    .trim()
    .lowercase()
    .email("Not a valid email."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["admin", "user"]).default("user"),
});

export type UserSchema = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginType = z.infer<typeof LoginSchema>;