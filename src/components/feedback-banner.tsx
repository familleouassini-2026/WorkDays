"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, X, Send, Bug, Lightbulb, HelpCircle } from "lucide-react";

const TYPES = [
  { id: "bug", label: "Bug", icon: Bug, color: "text-red-600 bg-red-50 border-red-200" },
  { id: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "question", label: "Question", icon: HelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
];

export default function FeedbackBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("user_feedback").insert({
      page_url: pathname,
      feedback_type: type,
      message: message.trim(),
    });
    setSending(false);
    setSent(true);
    setMessage("");
    setTimeout(() => { setSent(false); setOpen(false); }, 2000);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
      >
        <MessageSquare className="w-4 h-4" />
        Feedback
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Donner un feedback</span>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-200 text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {sent ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-green-800">Merci pour votre feedback !</p>
          <p className="text-xs text-slate-500 mt-1">Il sera examiné prochainement.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Page context */}
          <div className="text-xs text-slate-400 bg-slate-50 rounded px-2 py-1 font-mono truncate">
            {pathname}
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                    isActive ? t.color + " border-current" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez le problème, votre suggestion ou votre question..."
            rows={3}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
