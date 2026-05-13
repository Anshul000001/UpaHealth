import { prisma } from "@/lib/prisma";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validators/product";

export async function getProducts(opts: {
  search?: string;
  category?: string;
  cursor?: string;
  pageSize?: number;
}) {
  const { search, category, cursor, pageSize = 20 } = opts;
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(category && category !== "all" ? { category } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { name: "asc" },
      include: { supplier: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const hasMore = items.length > pageSize;
  const data = hasMore ? items.slice(0, pageSize) : items;
  return { data, total, nextCursor: hasMore ? data[data.length - 1].id : undefined };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { supplier: true },
  });
}

export async function createProduct(input: ProductCreateInput) {
  return prisma.product.create({ data: input });
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data: input });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
