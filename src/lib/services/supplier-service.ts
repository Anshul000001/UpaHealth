import { prisma } from "@/lib/prisma";
import type { SupplierCreateInput, SupplierUpdateInput } from "@/lib/validators/supplier";

export async function getSuppliers(opts: {
  search?: string;
  cursor?: string;
  pageSize?: number;
}) {
  const { search, cursor, pageSize = 20 } = opts;
  const where = {
    archived: false,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
            { certifications: { has: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { trustScore: "desc" },
      include: { products: { select: { id: true, name: true, category: true } } },
    }),
    prisma.supplier.count({ where }),
  ]);

  const hasMore = items.length > pageSize;
  const data = hasMore ? items.slice(0, pageSize) : items;
  return { data, total, nextCursor: hasMore ? data[data.length - 1].id : undefined };
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: { products: true },
  });
}

export async function createSupplier(input: SupplierCreateInput) {
  return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: string, input: SupplierUpdateInput) {
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function archiveSupplier(id: string) {
  return prisma.supplier.update({ where: { id }, data: { archived: true } });
}
