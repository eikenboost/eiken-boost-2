import { NextResponse } from "next/server";
import { evaluateSpeaking, evaluateWriting } from "@/lib/ai";

export async function POST(request: Request) {
  const { type, prompt, answer } = await request.json();

  if (!prompt || !answer) {
    return NextResponse.json({ error: "Missing prompt or answer" }, { status: 400 });
  }

  const result = type === "speaking" ? await evaluateSpeaking(prompt, answer) : await evaluateWriting(prompt, answer);
  return NextResponse.json(result);
}
