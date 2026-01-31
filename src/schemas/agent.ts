import { z } from "zod";

export const AgentProfileSchema = z.object({
  agentId: z.string().uuid(),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email(),
  agencyName: z.string().min(2, "Agency name is required"),
  agencyLogoUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),

  writingSamples: z.array(z.string()).default([]),
  tonePreference: z.enum(["Professional", "Conversational", "Luxury", "Urgent"]).default("Professional"),

  subscriptionStatus: z.enum(["Trial", "Active", "PastDue", "Canceled"]).default("Trial"),
  stripeCustomerId: z.string().optional(),

  createdAt: z.date(),
  lastUpdated: z.date(),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;
