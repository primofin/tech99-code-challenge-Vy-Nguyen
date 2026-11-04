import { z } from "zod";

export const STATUSES = ["active", "archived"] as const;

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: (typeof STATUSES)[number];
  createdAt: string;
  updatedAt: string;
}

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(2000).default(""),
  price: z.number().nonnegative(),
  category: z.string().trim().min(1).max(100),
  status: z.enum(STATUSES).default("active"),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });

export const listQuerySchema = z.object({
  q: z.string().trim().min(1).optional(), // search in name/description
  category: z.string().trim().min(1).optional(),
  status: z.enum(STATUSES).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "price", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.coerce.number().int().positive();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
