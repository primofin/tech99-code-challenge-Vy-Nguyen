import type { Db } from "./db";
import type {
  CreateProductInput,
  ListQuery,
  Product,
  UpdateProductInput,
} from "./product";

interface Row {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: Product["status"];
  created_at: string;
  updated_at: string;
}

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: r.price,
  category: r.category,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// Whitelist: never interpolate user input into SQL directly.
const SORT_COLUMNS = { createdAt: "created_at", price: "price", name: "name" } as const;

export class ProductRepository {
  constructor(private readonly db: Db) {}

  create(input: CreateProductInput): Product {
    const now = new Date().toISOString();
    const info = this.db
      .prepare(
        `INSERT INTO products (name, description, price, category, status, created_at, updated_at)
         VALUES (@name, @description, @price, @category, @status, @now, @now)`
      )
      .run({ ...input, now });
    return this.findById(Number(info.lastInsertRowid))!;
  }

  findById(id: number): Product | undefined {
    const row = this.db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Row | undefined;
    return row ? toProduct(row) : undefined;
  }

  list(q: ListQuery): { items: Product[]; total: number } {
    const where: string[] = [];
    const params: Record<string, unknown> = {};

    if (q.q) {
      where.push("(name LIKE @search OR description LIKE @search)");
      params.search = `%${q.q}%`;
    }
    if (q.category) {
      where.push("category = @category");
      params.category = q.category;
    }
    if (q.status) {
      where.push("status = @status");
      params.status = q.status;
    }
    if (q.minPrice !== undefined) {
      where.push("price >= @minPrice");
      params.minPrice = q.minPrice;
    }
    if (q.maxPrice !== undefined) {
      where.push("price <= @maxPrice");
      params.maxPrice = q.maxPrice;
    }

    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const direction = q.order === "asc" ? "ASC" : "DESC";

    const total = (
      this.db.prepare(`SELECT COUNT(*) AS c FROM products ${clause}`).get(params) as { c: number }
    ).c;

    const rows = this.db
      .prepare(
        `SELECT * FROM products ${clause}
         ORDER BY ${SORT_COLUMNS[q.sortBy]} ${direction}, id ${direction}
         LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: q.limit, offset: (q.page - 1) * q.limit }) as Row[];

    return { items: rows.map(toProduct), total };
  }

  update(id: number, input: UpdateProductInput): Product | undefined {
    const columns: Record<string, string> = {
      name: "name",
      description: "description",
      price: "price",
      category: "category",
      status: "status",
    };
    const sets = Object.keys(input)
      .filter((k) => k in columns)
      .map((k) => `${columns[k]} = @${k}`);

    const info = this.db
      .prepare(`UPDATE products SET ${[...sets, "updated_at = @now"].join(", ")} WHERE id = @id`)
      .run({ ...input, id, now: new Date().toISOString() });

    return info.changes ? this.findById(id) : undefined;
  }

  delete(id: number): boolean {
    return this.db.prepare("DELETE FROM products WHERE id = ?").run(id).changes > 0;
  }
}
