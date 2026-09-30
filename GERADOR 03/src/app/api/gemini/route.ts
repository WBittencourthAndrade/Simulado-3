import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_GEMINI_API_KEY, geminiBaseUrl } from "@/lib/gemini";

// Proxy usado pela página /especialista-fcc.html quando o usuário não informou chave própria.
// A chave GEMINI_API_KEY permanece somente no servidor.
export async function POST(req: NextRequest) {
  if (!DEFAULT_GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const { model, payload } = await req.json().catch(() => ({}));
  if (typeof model !== "string" || !/^gemini-[\w.-]+$/.test(model) || !payload) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const res = await fetch(
    `${geminiBaseUrl(DEFAULT_GEMINI_API_KEY)}/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": DEFAULT_GEMINI_API_KEY },
      body: JSON.stringify(payload),
    }
  );

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
