import { NextResponse } from "next/server";
import { getTerritoriesList } from "@/lib/queries";

export async function GET() {
  return NextResponse.json({ territories: await getTerritoriesList() });
}
