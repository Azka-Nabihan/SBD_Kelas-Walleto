import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
})

export const goalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Target amount must be a positive number',
  }),
  deadline: z.string().min(1, 'Deadline is required'),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense']),
}) 