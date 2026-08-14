import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, ExternalLink, Mic, Send, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Alert from "../components/Alert";
import { useAccessibility } from "../context/AccessibilityContext";
import { http } from "../api/http";
import { getSpeechRecognition, speakText } from "../utils/speech";

const starterPrompts = [
  "Which schemes help small farmers?",
  "How can I apply for crop insurance?",
  "Show solar subsidy schemes",
  "Tell me about livestock support"
];

export default function Chatbot() {
  const { speechLang } = useAccessibility();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste. I can help you find schemes, check eligibility, and explain application steps.",
      suggestions: starterPrompts,
      schemes: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(messageText = input) {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const { data } = await http.post("/chatbot/message", { message: trimmed, language: i18n.language });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.reply.answer,
          intent: data.reply.intent,
          suggestions: data.reply.suggestions || [],
          schemes: data.reply.schemes || []
        }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Chatbot could not answer right now.");
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setError("Voice input could not hear clearly. Please try again.");
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <section className="grid min-h-[calc(100vh-130px)] gap-5 lg:grid-rows-[auto_1fr_auto]">
      <div className="rounded-md bg-leaf px-5 py-6 text-white shadow-sm sm:px-7">
        <p className="flex items-center gap-2 text-sm font-semibold text-green-100">
          <Sparkles size={18} /> {t("chatbot:title", "Chatbot")}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{t("chatbot:chatbotTitle", "Farmer AI Assistant")}</h1>
        <p className="mt-3 max-w-3xl text-green-50">{t("chatbot:chatbotIntro", "Ask me anything about schemes, eligibility, and farming advice.")}</p>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      <div className="overflow-hidden rounded-md border border-green-100 bg-white shadow-sm">
        <div className="max-h-[58vh] overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={`${message.role}-${index}`}
                message={message}
                speechLang={speechLang}
                onSuggestion={sendMessage}
              />
            ))}
            {loading ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Bot size={18} /> {t("chatbot:chatbotThinking", "Thinking...")}
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
        className="rounded-md border border-green-100 bg-white p-3 shadow-sm"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startVoiceInput}
            className={`focus-ring rounded-md px-3 ${listening ? "bg-leaf text-white" : "border border-slate-200 text-slate-700"}`}
            title={t("common:voiceSearch", "Voice Search")}
          >
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="focus-ring min-h-12 flex-1 rounded-md border border-slate-300 px-3 text-slate-950"
            placeholder={t("chatbot:chatbotPlaceholder", "Ask a question...")}
          />
          <button disabled={loading} className="focus-ring inline-flex items-center gap-2 rounded-md bg-leaf px-4 font-bold text-white disabled:opacity-60">
            <Send size={18} /> {t("common:send", "Send")}
          </button>
        </div>
      </form>
    </section>
  );
}

function ChatMessage({ message, speechLang, onSuggestion }) {
  const { t } = useTranslation();
  const isUser = message.role === "user";
  const text = message.text;

  return (
    <article className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-green-50 text-leaf">
          <Bot size={20} />
        </span>
      ) : null}
      <div className={`max-w-3xl rounded-md px-4 py-3 ${isUser ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}>
        <div className="leading-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        {!isUser ? (
          <button
            type="button"
            onClick={() => speakText(text, speechLang)}
            className="focus-ring mt-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-leaf"
          >
            {t("common:listen", "Listen")}
          </button>
        ) : null}
        {message.schemes?.length ? <SchemeResults schemes={message.schemes} /> : null}
        {message.suggestions?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestion(suggestion)}
                className="focus-ring rounded-md border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-leaf"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {isUser ? (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-900 text-white">
          <UserRound size={20} />
        </span>
      ) : null}
    </article>
  );
}

function SchemeResults({ schemes }) {
  const { t } = useTranslation();
  return (
    <div className="mt-3 grid gap-2">
      {schemes.map((scheme) => (
        <Link key={scheme.id} to={`/schemes/${scheme.id}`} className="rounded-md border border-green-100 bg-white p-3 text-slate-800 hover:bg-green-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold">{scheme.schemeName}</p>
              <p className="mt-1 text-xs text-slate-500">{scheme.category}</p>
            </div>
            <span className="shrink-0 rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-leaf">
              {scheme.score || 0}%
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{scheme.reason}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-leaf">
            {t("schemes:openDetails", "View details")} <ExternalLink size={13} />
          </span>
        </Link>
      ))}
    </div>
  );
}
