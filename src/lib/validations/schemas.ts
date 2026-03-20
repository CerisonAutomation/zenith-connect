import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters').max(72),
  username: z.string().min(3).max(32).regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, _ and - only'),
  age: z.number().int().min(18, 'Must be 18+').max(99),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  looking_for: z.array(z.string()).max(5).optional(),
  height_cm: z.number().int().min(100).max(250).optional(),
  travel_mode: z.boolean().optional(),
})

export const MessageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  timestamp: z.number(),
  type: z.enum(['text', 'media', 'system']),
  edited: z.boolean().optional(),
  replyTo: z.string().uuid().optional(),
})

export const ReactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().emoji().max(2),
  senderId: z.string().uuid(),
})

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
export type MessageInput = z.infer<typeof MessageSchema>
export type LocationInput = z.infer<typeof LocationSchema>
