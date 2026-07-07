import { env, hasOpenAiEnv } from "@/lib/env";
import type { SpeakingFeedback, WritingFeedback } from "@/lib/types";

async function callCompatibleChat(system: string, user: string) {
  const response = await fetch(`${env.openAiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string;
}

function parseJsonBlock<T>(value: string): T {
  const cleaned = value.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as T;
}

function scoreFromLength(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words >= 80) return 78;
  if (words >= 60) return 68;
  if (words >= 40) return 58;
  return 45;
}

export async function evaluateWriting(prompt: string, answer: string): Promise<WritingFeedback> {
  if (hasOpenAiEnv) {
    const result = await callCompatibleChat(
      "You are a strict but supportive Eiken Grade 2 writing coach. Reply only in JSON with keys: score, grammarFeedback, structureFeedback, vocabFeedback, improvedAnswer, coachComment. All feedback must be in Japanese.",
      `Prompt: ${prompt}\nAnswer: ${answer}`,
    );
    return parseJsonBlock<WritingFeedback>(result);
  }

  const score = scoreFromLength(answer);
  return {
    score,
    grammarFeedback: [
      "主語と動詞の一致を確認しましょう。三単現の s が抜けやすいです。",
      "because の後ろは 1 文で簡潔にし、長い日本語発想の文を避けましょう。",
    ],
    structureFeedback: [
      "1文目で自分の立場を明確にすると、採点者に伝わりやすくなります。",
      "理由は 2 つに分けて、First / Second を入れるとまとまります。",
    ],
    vocabFeedback: [
      "good / bad だけでなく useful, convenient, effective を使い分けましょう。",
      "最後のまとめで in my opinion を繰り返さず、For these reasons で締めると自然です。",
    ],
    improvedAnswer:
      "I think high school students should have a part-time job. First, they can learn how to work with other people and manage their time. Second, they can understand the value of money by earning it themselves. However, they should not work too many hours because school work is also important. For these reasons, a part-time job can be a good experience for students.",
    coachComment: score >= 70 ? "内容は十分伝わっています。次は理由ごとの具体例を1つ入れて完成度を上げましょう。" : "意見は書けていますが、理由の広げ方がまだ弱いです。まずは『主張→理由1→理由2→結論』の型を固定しましょう。",
  };
}

export async function evaluateSpeaking(prompt: string, answer: string): Promise<SpeakingFeedback> {
  if (hasOpenAiEnv) {
    const result = await callCompatibleChat(
      "You are a strict but supportive Eiken Grade 2 speaking coach. Reply only in JSON with keys: score, qualityFeedback, naturalPhrasing, sampleAnswer, coachComment. All feedback must be in Japanese.",
      `Prompt: ${prompt}\nAnswer: ${answer}`,
    );
    return parseJsonBlock<SpeakingFeedback>(result);
  }

  const score = scoreFromLength(answer);
  return {
    score,
    qualityFeedback: [
      "最初の1文で結論を言えているか確認しましょう。Yes/No の後に理由をすぐ続けると安定します。",
      "答えが短いと減点されやすいので、理由 + 具体例の2段構成を意識してください。",
    ],
    naturalPhrasing: [
      "I think so because ...",
      "One reason is that ...",
      "For example, ...",
    ],
    sampleAnswer:
      "Yes, I think people should read news every day. One reason is that news helps us understand what is happening in society. For example, students can learn about the environment, technology, and world events. It is also useful because we can talk about these topics with other people.",
    coachComment: score >= 70 ? "伝わる答え方ができています。次はつなぎ表現を増やして、より自然に話しましょう。" : "短く終わりやすいので、まずは 3 文で答える練習を続けましょう。結論→理由→例 の順で安定します。",
  };
}
