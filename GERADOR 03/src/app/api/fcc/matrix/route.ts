import { NextResponse } from "next/server";
import { FCC_INCIDENCE_MATRIX, FCC_CLASSIC_TRAPS_LIST } from "@/lib/fcc-knowledge-base";

export async function GET() {
  return NextResponse.json({
    success: true,
    matrix: FCC_INCIDENCE_MATRIX,
    traps: FCC_CLASSIC_TRAPS_LIST,
  });
}
