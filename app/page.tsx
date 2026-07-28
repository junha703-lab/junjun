"use client";

import { useEffect, useMemo, useState } from "react";

type Result = {
  id: string;
  subject: string;
  title: string;
  text: string;
  tags: string[];
  savedAt?: string;
};

const subjects = ["국어", "수학", "영어", "과학", "사회", "예체능"];
const sampleResults: Result[] = [
  {
    id: "sample-1",
    subject: "과학",
    title: "기후 변화 데이터 분석 프로젝트",
    text: "기후 변화에 관한 다양한 자료를 비교·분석하고, 지역별 평균 기온의 변화 추이를 그래프로 시각화함. 자료의 출처와 측정 조건을 꼼꼼히 확인하며 탐구 결과를 논리적으로 설명하고, 생활 속 탄소 배출을 줄이기 위한 실천 방안을 구체적으로 제안함.",
    tags: ["자료 분석", "논리적 사고", "문제 해결"],
  },
  {
    id: "sample-2",
    subject: "국어",
    title: "현대시 속 화자의 정서 탐구",
    text: "현대시 작품을 읽고 시어와 표현 방법이 화자의 정서 형성에 미치는 영향을 주도적으로 탐구함. 작품 간 공통점과 차이점을 근거를 들어 설명하고, 자신의 해석을 친구들과 나누며 다양한 관점을 존중하는 태도를 보임.",
    tags: ["문학 감상", "의사소통", "주도성"],
  },
];

export default function Home() {
  const [grade, setGrade] = useState("2");
  const [subject, setSubject] = useState("과학");
  const [keywords, setKeywords] = useState("기후 변화, 데이터 분석, 환경 문제 해결에 관심이 많고 관련 자료를 찾아 발표함");
  const [model, setModel] = useState("gemini-3.5-flash-lite");
  const [result, setResult] = useState<Result | null>(sampleResults[0]);
  const [history, setHistory] = useState<Result[]>(sampleResults);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("student-records");
    if (stored) setHistory(JSON.parse(stored));
    fetch("/api/records")
      .then((response) => response.json())
      .then((data) => {
        if (!data.records?.length) return;
        const remote: Result[] = data.records.map((item: { id: string; subject: string; title: string; content: string; tags: string[]; saved_at: string }) => ({ id: item.id, subject: item.subject, title: item.title, text: item.content, tags: item.tags || [], savedAt: item.saved_at ? new Date(item.saved_at).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "저장된 기록" }));
        setHistory(remote);
      })
      .catch(() => undefined);
  }, []);

  const wordCount = useMemo(() => keywords.trim() ? keywords.trim().split(/\s+/).length : 0, [keywords]);

  async function generate() {
    if (!keywords.trim()) {
      setNotice("활동 키워드나 관찰 내용을 먼저 입력해 주세요.");
      return;
    }
    setIsGenerating(true);
    setNotice("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, keywords, model }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "생성에 실패했습니다.");
      setResult(data.result);
    } catch {
      setResult({
        id: crypto.randomUUID(),
        subject,
        title: `${subject} 탐구 활동과 성찰`,
        text: `${keywords.trim()}에 대한 관심을 바탕으로 관련 자료를 주도적으로 탐색하고 핵심 내용을 정리함. 탐구 과정에서 얻은 근거를 바탕으로 자신의 생각을 구체적으로 표현하며, 배운 내용을 실제 문제 해결에 연결하려는 태도가 돋보임. 활동 결과를 성찰하고 다음 탐구 방향을 스스로 확장해 나감.`,
        tags: ["주도적 탐구", "자료 활용", "문제 해결"],
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveResult() {
    if (!result) return;
    const saved = { ...result, savedAt: new Date().toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) };
    const next = [saved, ...history.filter((item) => item.id !== result.id)].slice(0, 12);
    setHistory(next);
    window.localStorage.setItem("student-records", JSON.stringify(next));
    try {
      await fetch("/api/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...saved, grade }) });
    } catch { /* Supabase 환경변수가 없는 데모 모드에서는 로컬 저장을 사용합니다. */ }
    setNotice("결과를 저장했습니다. 저장 내역에서 다시 확인할 수 있어요.");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>세특메이커</span></div>
        <nav className="side-nav" aria-label="주요 메뉴">
          <button className="nav-item active"><span className="nav-icon">✦</span>새로 작성</button>
          <button className="nav-item" onClick={() => document.getElementById("history")?.scrollIntoView({ behavior: "smooth" })}><span className="nav-icon">▤</span>저장 내역 <span className="nav-count">{history.length}</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="mini-avatar">T</div><div><strong>교사 계정</strong><small>teacher@school.kr</small></div><span className="more">•••</span></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">AI 기록 도우미</span><h1>세특 초안 작성</h1></div><button className="help-button">? <span>도움말</span></button></header>
        <div className="workspace">
          <section className="editor-column">
            <div className="step-label"><span>01</span><div><strong>학생 활동 입력</strong><small>학생의 활동과 관찰 내용을 자유롭게 적어주세요.</small></div></div>
            <div className="form-card">
              <div className="field-row"><label>학년</label><select value={grade} onChange={(e) => setGrade(e.target.value)}><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select><label className="subject-label">과목</label><select value={subject} onChange={(e) => setSubject(e.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select></div>
              <label className="textarea-label" htmlFor="keywords">활동 키워드 또는 관찰 내용</label>
              <textarea id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="예: 모둠 활동에서 친구들의 의견을 경청하고..." />
              <div className="textarea-footer"><span>{wordCount} words</span><span className="tip">구체적인 행동과 결과를 적을수록 좋아요 <i>i</i></span></div>
              <div className="form-actions"><label className="model-select">사용 모델 <select value={model} onChange={(e) => setModel(e.target.value)}><option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite</option><option value="gemini-2.5-flash">Gemini 2.5 Flash</option></select></label><button className="primary-button" onClick={generate} disabled={isGenerating}>{isGenerating ? <><span className="spinner" /> 작성 중...</> : <>✦ 초안 생성하기 <span>⌘↵</span></>}</button></div>
            </div>

            <div className="step-label result-step"><span>02</span><div><strong>생성 결과</strong><small>AI가 작성한 초안을 검토하고 필요한 부분을 다듬어보세요.</small></div></div>
            <div className="result-card">
              {result ? <><div className="result-head"><div><span className="result-subject">{result.subject} · {grade}학년</span><h2>{result.title}</h2></div><button className="copy-button" onClick={() => navigator.clipboard?.writeText(result.text).then(() => setNotice("문장을 클립보드에 복사했습니다."))}>▣ 복사</button></div><p className="result-text">{result.text}</p><div className="tags">{result.tags.map((tag) => <span key={tag}># {tag}</span>)}</div><div className="result-footer"><span><span className="status-dot" /> 검토 권장</span><button className="save-button" onClick={saveResult}>저장하기 <span>→</span></button></div></> : <div className="empty-result">위 내용을 입력하고 초안 생성을 눌러주세요.</div>}
            </div>
            {notice && <div className="notice">{notice}</div>}
          </section>

          <aside className="history-panel" id="history"><div className="panel-heading"><div><span className="eyebrow">MY RECORDS</span><h2>저장 내역</h2></div><span className="record-count">{history.length}</span></div><p className="panel-description">저장한 세특 초안을 다시 확인하고<br />필요할 때 불러올 수 있어요.</p><div className="history-list">{history.map((item) => <button className={`history-item ${result?.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => setResult(item)}><div className="history-item-top"><span>{item.subject}</span><small>{item.savedAt || "최근 작성"}</small></div><strong>{item.title}</strong><p>{item.text}</p></button>)}</div><button className="all-records">전체 기록 보기 <span>→</span></button></aside>
        </div>
      </section>
    </main>
  );
}

