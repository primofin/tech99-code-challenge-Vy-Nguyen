import express from "express";
import type { Db } from "./db";
import { errorHandler, notFoundHandler } from "./errors";
import { productRoutes } from "./productRoutes";
import { ProductRepository } from "./productRepository";

export function createApp(db: Db) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/products", productRoutes(new ProductRepository(db)));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
