import { z } from 'zod'

export const GraphDataRequestSchema = z.object({
  collection: z.string().min(1).max(100),
  context: z.string().min(1).max(100),
  isStream: z.boolean().optional().default(false),
  params: z.record(z.unknown()).optional().default({}),
})

export type ValidatedGraphDataRequest = z.infer<typeof GraphDataRequestSchema>
