import crypto from "node:crypto";
import { getPrisma } from "@/lib/db";

const fallbackBannedWords = [
  "admin",
  "moderador",
  "suporte",
  "script",
  "golpe",
  "casino",
  "aposta",
];

export function sanitizeText(value: string, maxLength: number) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function getBannedWords() {
  try {
    const prisma = getPrisma();
    const words = await prisma.bannedWord.findMany({ select: { word: true } });
    return words.length ? words.map((entry) => entry.word.toLowerCase()) : fallbackBannedWords;
  } catch {
    return fallbackBannedWords;
  }
}

export function containsBannedWord(value: string, bannedWords: string[]) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return bannedWords.some((word) => {
    const cleanWord = word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return new RegExp(`\\b${escapeRegExp(cleanWord)}\\b`, "i").test(normalized);
  });
}

export function timingSafeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function hmacSha256(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
