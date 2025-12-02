import { z } from "zod"

export const loginSchema = z.object({
    email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
    password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be atleast 8 characters"),
});

export const signupSchema = z.object({
    name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z\s]+$/, "Name must only contain letters"),
    email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),
    password: z
    .string()
    .min(8, "Password must be 8 characters or more")
    .regex(/[A-Z]/, "Password must have at least one uppercase letter")
    .regex(/[0-9]/, "Password must have atleast one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
