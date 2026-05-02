import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
  __compreOTopoPrisma?: PrismaClient;
};

export function getPrisma() {
  const globalForPrisma = globalThis as GlobalWithPrisma;

  if (!globalForPrisma.__compreOTopoPrisma) {
    globalForPrisma.__compreOTopoPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return globalForPrisma.__compreOTopoPrisma;
}
