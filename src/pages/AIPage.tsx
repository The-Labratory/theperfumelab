import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, Square, Trash2, Loader2, Plus, MessageCircle, ArrowLeft, Clock,
} from "lucide-react";
import { useGrokChat } from "@/hooks/useGrokChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const AIPage = () => {
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const { messages, isStreaming, send, stopStreaming, clearChat, convId, loadConversation } =
    useGrokChat();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, convId]);

  const handleSend = () => {
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const newChat = () => {
    clearChat();
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-72 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-display font-semibold text-sm tracking-wide flex-1 text-foreground">Conversations</h2>
            <button
              onClick={newChat}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-body transition-colors truncate ${
                    convId === c.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 ml-5">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[10px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 font-body">
                  No conversations yet
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          {!showSidebar && (
            <button onClick={() => setShowSidebar(true)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-display font-bold tracking-wide text-foreground">Grok AI Assistant</h1>
            <p className="text-xs text-muted-foreground font-body">Powered by xAI · Your intelligent companion</p>
          </div>
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-display tracking-wide hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
          {showSidebar && (
            <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground lg:hidden">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
                >
                  <Bot className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-lg font-display font-bold text-foreground mb-2">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground font-body max-w-md">
                  Ask me about fragrances, scent recommendations, ingredient chemistry, or anything else.
                </p>
                <div className="flex flex-wrap gap-2 mt-6 max-w-lg justify-center">
                  {[
                    "What are the best base notes for longevity?",
                    "Create a scent profile for a summer evening",
                    "Explain the difference between EDP and EDT",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="px-3 py-2 rounded-xl border border-border text-xs font-body text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground italic font-body">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border px-6 py-4 bg-card/50">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <button
              onClick={clearChat}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Grok…"
              rows={1}
              className="flex-1 resize-none bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-32 font-body"
            />
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="p-2.5 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex-shrink-0"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
