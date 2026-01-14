import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quoteEngineUrl = process.env.QUOTE_ENGINE_URL || "http://localhost:8001";
    const response = await fetch(quoteEngineUrl + "/quote", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate quote" }, { status: 500 });
  }
}
