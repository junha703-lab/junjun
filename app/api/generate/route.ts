import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { grade, subject, keywords, model } = await request.json();
  if (!keywords?.trim()) return NextResponse.json({ error: "활동 내용을 입력해 주세요." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const prompt = `당신은 한국 고등학교 교사의 생활기록부 세부능력 및 특기사항 작성 도우미입니다. ${grade}학년 ${subject} 과목입니다. 아래 관찰 내용을 바탕으로 2~3문장의 세특 초안을 작성하세요. 학생을 주어로 반복하지 말고, 구체적인 행동·과정·성장을 중심으로 긍정적이고 객관적으로 작성하세요. 과장이나 확인되지 않은 성취는 추가하지 마세요. 금지어와 서열 표현은 사용하지 마세요. 제목과 본문만 JSON으로 반환하세요. 관찰 내용: ${keywords}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, responseMimeType: "application/json" } }),
    });
    if (response.ok) {
      const data = await response.json();
      const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
      return NextResponse.json({ result: { id: crypto.randomUUID(), subject, title: parsed.title || `${subject} 탐구 활동`, text: parsed.text || parsed.body, tags: ["주도적 탐구", "자료 활용", "성찰"] } });
    }
  }

  return NextResponse.json({ result: { id: crypto.randomUUID(), subject, title: `${subject} 탐구 활동과 성찰`, text: `${keywords.trim()}에 대한 관심을 바탕으로 관련 자료를 주도적으로 탐색하고 핵심 내용을 정리함. 탐구 과정에서 얻은 근거를 바탕으로 자신의 생각을 구체적으로 표현하며, 배운 내용을 실제 문제 해결에 연결하려는 태도가 돋보임. 활동 결과를 성찰하고 다음 탐구 방향을 스스로 확장해 나감.`, tags: ["주도적 탐구", "자료 활용", "문제 해결"] } });
}

