import { z } from "zod";

export const createPaymentSchema = z.object({
  publicName: z.string().min(2).max(40),
  message: z.string().max(80).optional().nullable(),
  country: z.string().min(2).max(60),
  state: z.string().max(60).optional().nullable(),
  city: z.string().max(60).optional().nullable(),
  territorySlug: z.string().min(2).max(120),
  amountCents: z.coerce.number().int().min(100).max(500_000),
});

export const rankingQuerySchema = z.object({
  scope: z.enum(["global", "country", "state", "city"]).default("global"),
  country: z.string().max(60).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  city: z.string().max(60).optional().nullable(),
  search: z.string().max(80).optional().nullable(),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const adminPatchUserSchema = z.object({
  isBanned: z.boolean().optional(),
  hideMessage: z.boolean().optional(),
});
