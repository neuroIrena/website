import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Question,
  QuestionActions,
  QuestionDescription,
  QuestionOption,
  QuestionOptions,
  QuestionSubmit,
} from "@/components/ai-elements/question";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Entry, Prompt } from "./useConversation";

type Props = {
  entries: Entry[];
  typing: boolean;
  prompt: Prompt | null;
  onAnswer: (value: string, label?: string) => void;
  /** Rendered after the transcript, in place of a prompt (the feed). */
  children?: ReactNode;
};

/**
 * The transcript, with whatever the participant is being asked right now as its last item.
 * It is part of the page: the window scrolls, and follows the newest item.
 */
export function ChatView({ entries, typing, prompt, onAnswer, children }: Props) {
  const end = useRef<HTMLDivElement>(null);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: reduced ? "auto" : "smooth" });
  }, [entries.length, typing, prompt, children, reduced]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8" aria-live="polite">
      {entries.map((e) => (
        <Message key={e.id} from={e.from} className={e.from === "assistant" ? "max-w-full" : undefined}>
          <MessageContent className="text-lg leading-relaxed">{e.content}</MessageContent>
        </Message>
      ))}
      {typing && (
        <div className="flex h-7 items-center gap-1" aria-label="Typing">
          <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
          <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
        </div>
      )}
      {prompt && !typing && <PromptArea prompt={prompt} onAnswer={onAnswer} />}
      {children}
      <div ref={end} className="h-px scroll-mb-8" aria-hidden="true" />
    </div>
  );
}

function PromptArea({ prompt, onAnswer }: { prompt: Prompt; onAnswer: Props["onAnswer"] }) {
  const first = useRef<HTMLButtonElement | HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, [prompt]);

  switch (prompt.kind) {
    case "buttons":
      return (
        <div className="flex flex-wrap justify-end gap-3">
          {prompt.options.map((o, i) => (
            <Button
              key={o.value}
              ref={i === 0 ? (first as React.RefObject<HTMLButtonElement>) : undefined}
              variant={i === 0 ? "default" : "outline"}
              onClick={() => onAnswer(o.value, o.label)}
            >
              {o.label}
            </Button>
          ))}
        </div>
      );
    case "action":
      return (
        <div className="flex justify-end">
          <Button ref={first as React.RefObject<HTMLButtonElement>} onClick={() => onAnswer(prompt.label)}>
            {prompt.label}
          </Button>
        </div>
      );
    case "consent":
      return <ConsentPrompt prompt={prompt} onAnswer={onAnswer} />;
    case "choice":
      return (
        <Question selectionMode="single" onSubmit={({ selectedValues }) => onAnswer(selectedValues[0])} className="bg-card">
          <QuestionOptions>
            {prompt.options.map((o) => (
              <QuestionOption key={o} value={o} className="rounded-full px-5">
                {o}
              </QuestionOption>
            ))}
          </QuestionOptions>
          <QuestionActions>
            <QuestionSubmit>{prompt.submit ?? "Send"}</QuestionSubmit>
          </QuestionActions>
        </Question>
      );
    case "scale": {
      const points = Array.from({ length: prompt.points ?? 7 }, (_, i) => String(i + 1));
      return (
        <Question selectionMode="single" onSubmit={({ selectedValues }) => onAnswer(selectedValues[0])} className="bg-card">
          <QuestionOptions className="gap-2">
            {points.map((p) => (
              <QuestionOption key={p} value={p} className="size-11 rounded-full px-0">
                {p}
              </QuestionOption>
            ))}
          </QuestionOptions>
          <QuestionDescription className="flex justify-between font-display">
            <span>1 = {prompt.low}</span>
            <span>
              {points.length} = {prompt.high}
            </span>
          </QuestionDescription>
          <QuestionActions>
            <QuestionSubmit>{prompt.submit ?? "Send"}</QuestionSubmit>
          </QuestionActions>
        </Question>
      );
    }
    case "duration":
      return <DurationPrompt submit={prompt.submit ?? "Send"} onAnswer={onAnswer} first={first as React.RefObject<HTMLInputElement>} />;
  }
}

function ConsentPrompt({ prompt, onAnswer }: { prompt: Extract<Prompt, { kind: "consent" }>; onAnswer: Props["onAnswer"] }) {
  const [ticked, setTicked] = useState<boolean[]>(() => prompt.statements.map(() => false));
  const all = ticked.every(Boolean);
  return (
    <form
      className="space-y-5 rounded-lg border bg-card p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (all) onAnswer("yes", prompt.agree);
      }}
    >
      <ul className="space-y-4">
        {prompt.statements.map((text, i) => {
          const id = `consent-${i}`;
          return (
            <li key={id} className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={ticked[i]}
                onCheckedChange={(v) => setTicked((t) => t.map((x, j) => (j === i ? v === true : x)))}
                className="mt-1.5 size-5"
              />
              <Label htmlFor={id} className="text-base leading-relaxed font-normal">
                {text}
              </Label>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => onAnswer("no", prompt.decline)}>
          {prompt.decline}
        </Button>
        <Button type="submit" disabled={!all}>
          {prompt.agree}
        </Button>
      </div>
    </form>
  );
}

function DurationPrompt({
  submit,
  onAnswer,
  first,
}: {
  submit: string;
  onAnswer: Props["onAnswer"];
  first: React.RefObject<HTMLInputElement>;
}) {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const m = minutes === "" ? 0 : Number(minutes);
  const s = seconds === "" ? 0 : Number(seconds);
  const valid = Number.isInteger(m) && Number.isInteger(s) && m >= 0 && s >= 0 && s < 60 && m * 60 + s > 0;
  const label = [m > 0 && `${m} minute${m === 1 ? "" : "s"}`, s > 0 && `${s} second${s === 1 ? "" : "s"}`]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onAnswer(String(m * 60 + s), label);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="est-min">Minutes</Label>
        <Input ref={first} id="est-min" type="number" inputMode="numeric" min={0} max={120} className="h-11 w-24 text-base" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="est-sec">Seconds</Label>
        <Input id="est-sec" type="number" inputMode="numeric" min={0} max={59} className="h-11 w-24 text-base" value={seconds} onChange={(e) => setSeconds(e.target.value)} />
      </div>
      <Button type="submit" disabled={!valid}>
        {submit}
      </Button>
    </form>
  );
}
