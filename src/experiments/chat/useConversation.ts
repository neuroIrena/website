import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/** What the participant is being asked to do right now, shown under the transcript. */
export type Prompt =
  | { kind: "buttons"; options: { label: string; value: string }[] }
  | { kind: "action"; label: string }
  | { kind: "choice"; options: string[]; submit?: string }
  | { kind: "scale"; low: string; high: string; points?: number; submit?: string }
  | { kind: "duration"; submit?: string };

export type Entry =
  | { id: number; from: "assistant"; content: ReactNode }
  | { id: number; from: "user"; content: string };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** How long the "typing" dots show before a message of this length appears. */
const typingDelay = (text: string) => (reducedMotion() ? 250 : Math.min(450 + text.length * 14, 2200));

/**
 * A scripted chat. `say` shows assistant messages one by one with a typing pause,
 * `ask` shows a prompt and resolves with the participant's answer. Together they let
 * the study be written as one plain async function.
 */
export function useConversation() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState(false);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const resolver = useRef<((value: string) => void) | null>(null);
  const nextId = useRef(0);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const push = useCallback((entry: Omit<Entry, "id">) => {
    setEntries((list) => [...list, { ...entry, id: nextId.current++ } as Entry]);
  }, []);

  const say = useCallback(
    async (messages: (string | { text: string; render: ReactNode })[]) => {
      for (const m of messages) {
        const text = typeof m === "string" ? m : m.text;
        setTyping(true);
        await new Promise((r) => setTimeout(r, typingDelay(text)));
        if (!alive.current) return;
        setTyping(false);
        push({ from: "assistant", content: typeof m === "string" ? m : m.render });
        await new Promise((r) => setTimeout(r, reducedMotion() ? 100 : 350));
      }
    },
    [push],
  );

  /** Shows a prompt and waits for the answer. `label` is what appears in the participant's bubble. */
  const ask = useCallback(
    (p: Prompt) =>
      new Promise<string>((resolve) => {
        resolver.current = resolve;
        setPrompt(p);
      }),
    [],
  );

  const answer = useCallback(
    (value: string, label = value) => {
      const resolve = resolver.current;
      resolver.current = null;
      setPrompt(null);
      push({ from: "user", content: label });
      resolve?.(value);
    },
    [push],
  );

  return { entries, typing, prompt, say, ask, answer };
}
