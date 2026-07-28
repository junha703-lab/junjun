import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const record = await request.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ saved: false, mode: "local" });
  const response = await fetch(`${url}/rest/v1/student_records`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ student_grade: record.grade, subject: record.subject, title: record.title, content: record.text, tags: record.tags, saved_at: record.savedAt }),
  });
  if (!response.ok) return NextResponse.json({ error: "Supabase 저장에 실패했습니다." }, { status: 502 });
  return NextResponse.json({ saved: true });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ records: [], mode: "local" });
  const response = await fetch(`${url}/rest/v1/student_records?select=*&order=created_at.desc&limit=20`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Supabase 조회에 실패했습니다." }, { status: 502 });
  const records = await response.json();
  return NextResponse.json({ records });
}

