import { z } from "zod";

export const AuthUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    isOnBoarding: z.boolean().optional(),
  })
  .passthrough();

export const LoginResponseEnvelopeSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    user: AuthUserSchema.optional(),
    stores: z.array(z.unknown()).optional(),
    seller: z
      .object({
        id: z.string(),
        applicationStatus: z.string().optional(),
        isOnboarded: z.boolean(),
        onboardingStep: z.number(),
        hasStores: z.boolean(),
      })
      .nullable()
      .optional(),
  }),
});

export const AuthResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  hasStores: z.boolean(),
  user: AuthUserSchema.optional(),
  seller: z
    .object({
      id: z.string(),
      applicationStatus: z.string().optional(),
      isOnboarded: z.boolean(),
      onboardingStep: z.number(),
      hasStores: z.boolean(),
    })
    .nullable()
    .optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthResult = z.infer<typeof AuthResultSchema>;
