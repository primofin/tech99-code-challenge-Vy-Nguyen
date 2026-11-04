import { Router } from "express";
import { HttpError } from "./errors";
import {
  createProductSchema,
  idParamSchema,
  listQuerySchema,
  updateProductSchema,
} from "./product";
import type { ProductRepository } from "./productRepository";

export function productRoutes(repo: ProductRepository): Router {
  const router = Router();

  // Create
  router.post("/", (req, res) => {
    const input = createProductSchema.parse(req.body);
    res.status(201).json(repo.create(input));
  });

  // List with filters, sorting and pagination
  router.get("/", (req, res) => {
    const query = listQuerySchema.parse(req.query);
    if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
      throw new HttpError(400, "minPrice cannot be greater than maxPrice");
    }
    const { items, total } = repo.list(query);
    res.json({
      data: items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  });

  // Get details
  router.get("/:id", (req, res) => {
    const id = idParamSchema.parse(req.params.id);
    const product = repo.findById(id);
    if (!product) throw new HttpError(404, "Product not found");
    res.json(product);
  });

  // Update (partial)
  router.patch("/:id", (req, res) => {
    const id = idParamSchema.parse(req.params.id);
    const input = updateProductSchema.parse(req.body);
    const product = repo.update(id, input);
    if (!product) throw new HttpError(404, "Product not found");
    res.json(product);
  });

  // Delete
  router.delete("/:id", (req, res) => {
    const id = idParamSchema.parse(req.params.id);
    if (!repo.delete(id)) throw new HttpError(404, "Product not found");
    res.status(204).send();
  });

  return router;
}
