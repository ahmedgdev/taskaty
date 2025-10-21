import * as zod from 'zod';

export const signupSchema = zod
  .object({
    firstName: zod
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters'),

    lastName: zod
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters'),
    age: zod.number().gte(0).lte(120),
    photoUrl: zod.url().optional(),
    email: zod
      .email('Invalid email address')
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
  email: zod.email(),
  password: zod.string(),
});

export const forgotPasswordSchema = zod.object({
  email: zod.email(),
});
