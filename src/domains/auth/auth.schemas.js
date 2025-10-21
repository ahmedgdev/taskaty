import * as zod from 'zod';

export const signupSchema = zod
  .object({
    firstName: zod
      .string()
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters'),

    lastName: zod
      .string()
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters'),
    age: zod.number().gte(0).lte(120),
    photoUrl: zod.url().trim().optional(),
    email: zod
      .email('Invalid email address')
      .trim()
      .min(5, 'Email must be at least 5 characters')
      .max(255, 'Email cannot exceed 255 characters'),
    password: zod
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),

    passwordConfirm: zod.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    error: 'Passwords do not match',
  });

export const loginSchema = zod.object({
  email: zod.email().trim(),
  password: zod
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

export const forgotPasswordSchema = zod.object({
  email: zod.email().trim(),
});

export const resetPasswordBodySchema = zod
  .object({
    password: zod
      .string('password is required and must be a valid string')
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),

    passwordConfirm: zod.string({
      message: 'passwordConfirm is required and must be a valid string',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    error: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export const resetPasswordParamsSchema = zod.object({
  resetToken: zod.string().trim().min(1, 'password reset token is required'),
});

export const updatePasswordSchema = zod
  .object({
    currentPassword: zod.string(),
    newPassword: zod
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ),
    passwordConfirm: zod.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    error: 'Passwords do not match',
    path: ['passwordConfirm'],
  });
