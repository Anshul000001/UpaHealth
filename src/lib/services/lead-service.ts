import { prisma } from "@/lib/prisma";
import type { LeadCreateInput, LeadUpdateInput } from "@/lib/validators/lead";

export async function getLeads(opts: {
  search?: string;
  stage?: string;
  cursor?: string;
  pageSize?: number;
}) {
  const { search, stage, cursor, pageSize = 20 } = opts;
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { contactPerson: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(stage ? { stage } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { quotations: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  const hasMore = items.length > pageSize;
  const data = hasMore ? items.slice(0, pageSize) : items;
  return { data, total, nextCursor: hasMore ? data[data.length - 1].id : undefined };
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { quotations: true, transitions: { orderBy: { changedAt: "desc" } } },
  });
}

export async function createLead(input: LeadCreateInput) {
  return prisma.lead.create({
    data: {
      ...input,
      email: input.email || null,
      nextFollowUp: input.nextFollowUp ? new Date(input.nextFollowUp) : null,
    },
  });
}

export async function updateLead(id: string, input: LeadUpdateInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      ...input,
      nextFollowUp: input.nextFollowUp ? new Date(input.nextFollowUp) : undefined,
      lastContactDate: input.lastContactDate ? new Date(input.lastContactDate) : undefined,
    },
  });
}

export async function advanceLeadStage(id: string, toStage: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");

  return prisma.$transaction([
    prisma.lead.update({
      where: { id },
      data: { stage: toStage, lastContactDate: new Date() },
    }),
    prisma.leadStageTransition.create({
      data: { leadId: id, fromStage: lead.stage, toStage },
    }),
  ]);
}
