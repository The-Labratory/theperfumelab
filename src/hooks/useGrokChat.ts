import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { streamChat, type ChatMessage } from "@/lib/streamChat";
import { toast } from "sonner";

export function useGrokChat(conversationId?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<string | null>(conversationId ?? null);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversation = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setConvId(id);
  }, []);

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || isStreaming) return;

      const userMsg: ChatMessage = { role: "user", content: input.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      let activeConvId = convId;

      // Create conversation if needed
      if (!activeConvId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { toast.error("Please sign in"); setIsStreaming(false); return; }

        const { data: conv } = await supabase
          .from("chat_conversations")
          .insert({ user_id: user.id, title: input.slice(0, 60) })
          .select("id")
          .single();
        if (!conv) { toast.error("Failed to create conversation"); setIsStreaming(false); return; }
        activeConvId = conv.id;
        setConvId(activeConvId);
      }

      // Save user message
      await supabase.from("chat_messages").insert({
        conversation_id: activeConvId,
        role: "user",
        content: input.trim(),
      });

      let assistantContent = "";
      const controller = new AbortController();
      abortRef.current = controller;

      const allMessages = [...messages, userMsg];

      await streamChat({
        messages: allMessages,
        signal: controller.signal,
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantContent } : m
              );
            }
            return [...prev, { role: "assistant", content: assistantContent }];
          });
        },
        onDone: async () => {
          setIsStreaming(false);
          abortRef.current = null;
          if (assistantContent) {
            await supabase.from("chat_messages").insert({
              conversation_id: activeConvId!,
              role: "assistant",
              content: assistantContent,
            });
          }
        },
        onError: (err) => {
          setIsStreaming(false);
          abortRef.current = null;
          toast.error(err);
        },
      });
    },
    [messages, isStreaming, convId]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConvId(null);
  }, []);

  return { messages, isStreaming, send, stopStreaming, clearChat, convId, loadConversation };
}
