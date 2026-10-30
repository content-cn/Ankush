import { useEffect, useRef, useState } from "react";

// --- Static content -------------------------------------------------------
const COMPANY = "MERIDIAN SOFTWORKS PRIVATE LIMITED";

// Compact topic shortcuts -> the question each one submits.
const TOPICS = [
  ["Leave & Time Off", "What are the leave and time off policies?"],
  ["Benefits", "What employee benefits does the company offer?"],
  ["Workplace Policies", "What are the key workplace policies?"],
  ["Travel & Expenses", "What is the travel and expense reimbursement policy?"],
  ["Onboarding", "What does the onboarding process involve?"],
];

// Suggested follow-ups shown under the latest answer.
const FOLLOW_UPS = [
  "How do I apply for leave?",
  "Can I carry forward my leaves?",
  "What is the maternity leave policy?",
];

// --- Tiny formatter -----------------------------------------------------
// The model replies in light Markdown (**bold**, ## headings, - bullets).
// Render just those three, inline, so answers read cleanly without pulling in
// a Markdown dependency.
function inlineBold(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function renderRich(text) {
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="rich-gap" />;
    if (t.startsWith("### ") || t.startsWith("## "))
      return (
        <div key={i} className="rich-h">
          {inlineBold(t.replace(/^#+ /, ""), i)}
        </div>
      );
    const bullet = t.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
    if (bullet)
      return (
        <div key={i} className="rich-li">
          <span className="rich-dot">•</span>
          <span>{inlineBold(bullet[1], i)}</span>
        </div>
      );
    return <p key={i} className="rich-p">{inlineBold(t, i)}</p>;
  });
}

// --- Small presentational pieces -----------------------------------------
function Avatar() {
  return <div className="avatar" aria-hidden="true">HR</div>;
}

function SourceTag({ citation }) {
  return (
    <div className="source">
      <span className="source-glyph">▣</span> Source · {citation}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="msg assistant">
      <Avatar />
      <div className="bubble card loading">
        <span className="dots"><i /><i /><i /></span>
        Searching company policies...
      </div>
    </div>
  );
}

// --- Main app -----------------------------------------------------------
export default function App() {
  // messages: { role, content, citation?, grounded?, isError? }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message / loading indicator.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const started = messages.length > 0;
  const lastMsg = messages[messages.length - 1];
  const showFollowUps =
    !loading && lastMsg?.role === "assistant" && !lastMsg.isError;

  // Send a question: show it immediately, then call POST /api/chat with the
  // prior conversation history and append the assistant's reply.
  async function ask(question) {
    const q = question.trim();
    if (!q || loading) return;

    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            citation: data.citation,
            grounded: data.grounded,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not reach the HR Assistant service. Is the backend running?",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="layout">
      {/* Left: branding / navigation (desktop only) */}
      <aside className="rail brand-rail">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div className="brand-company">{COMPANY}</div>
        </div>
        <div className="brand-product">HR Assistant</div>
        <p className="brand-note">Internal policy help for employees.</p>
        <nav className="rail-topics">
          {TOPICS.map(([label, q]) => (
            <button key={label} onClick={() => ask(q)} disabled={loading}>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Center: the conversation */}
      <main className="chat-col">
        <div className="mini-brand">
          <div className="brand-mark small">M</div>
          <div>
            <div className="mini-product">HR Assistant</div>
            <div className="mini-company">{COMPANY}</div>
          </div>
        </div>

        <header className="hero">
          <h1>Your HR questions, answered instantly</h1>
          <p>
            Answers are drawn only from {COMPANY}&rsquo;s official HR policy
            documents.
          </p>
        </header>

        <section className="conversation" aria-live="polite">
          {!started && (
            <div className="empty-hint card">
              Ask a question below, or pick a topic to get started.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === "assistant" && <Avatar />}
              <div className="msg-body">
                <div
                  className={
                    m.role === "user"
                      ? "bubble user-bubble"
                      : `bubble card${m.isError ? " error" : ""}`
                  }
                >
                  {m.role === "assistant" && !m.isError
                    ? renderRich(m.content)
                    : m.content}
                </div>
                {/* Citation only for grounded answers with a real source */}
                {m.role === "assistant" && m.grounded && m.citation && (
                  <SourceTag citation={m.citation} />
                )}
              </div>
            </div>
          ))}

          {loading && <LoadingBubble />}

          {showFollowUps && (
            <div className="followups">
              <span className="followups-label">Try asking</span>
              {FOLLOW_UPS.map((q) => (
                <button key={q} onClick={() => ask(q)} disabled={loading}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        {/* Composer: topic shortcuts + rounded input */}
        <form className="composer" onSubmit={onSubmit}>
          <div className="chips">
            {TOPICS.map(([label, q]) => (
              <button
                type="button"
                key={label}
                onClick={() => ask(q)}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about company policies..."
              aria-label="Ask about company policies"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </form>
      </main>

      {/* Right: how it works (desktop only) */}
      <aside className="rail how-rail">
        <div className="how-card card">
          <h2>How it works</h2>
          <ol>
            <li>Your question is matched against {COMPANY}&rsquo;s HR policy documents.</li>
            <li>The assistant answers using only the content of those documents.</li>
            <li>
              When an answer is grounded in a policy, a small source citation
              appears beneath it.
            </li>
          </ol>
        </div>
      </aside>
    </div>
  );
}
