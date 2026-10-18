import { useEffect, useRef, useState } from "react";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profile } from "@/lib/content";
import type { Entry, Prompt } from "./useConversation";

type Props = {
  entries: Entry[];
  typing: boolean;
  prompt: Prompt | null;
  onAnswer: (value: string, label?: string) => void;
};

/** The transcript plus whatever the participant is being asked right now. */
export function ChatView({ entries, typing, prompt, onAnswer }: Props) {
  return (
    <div className="flex h-full flex-col">
      <Conversation className="rounded-xl border bg-card">
        <ConversationContent className="gap-5 px-4 py-6 sm:px-6" aria-live="polite">
          {entries.map((e) =>
            e.from === "assistant" ? (
              <div key={e.id} className="flex gap-3">
                <Avatar />
                <Message from="assistant" className="pt-1">
                  <MessageContent className="text-lg leading-relaxed">{e.content}</MessageContent>
                </Message>
              </div>
            ) : (
              <Message key={e.id} from="user">
                <MessageContent className="text-lg leading-relaxed">{e.content}</MessageContent>
              </Message>
            ),
          )}
          {typing && (
            <div className="flex gap-3">
              <Avatar />
              <div className="flex h-8 items-center gap-1 pl-1" aria-label="Typing">
                <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
                <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Scroll to the latest message" />
      </Conversation>
      <div className="min-h-24 pt-4">{prompt && !typing && <PromptArea prompt={prompt} onAnswer={onAnswer} />}</div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="mt-1 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
      <img src={profile.logo} alt="" className="size-6 object-contain" />
    </span>
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
        <div className="flex flex-wrap gap-3">
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
        <Button ref={first as React.RefObject<HTMLButtonElement>} onClick={() => onAnswer(prompt.label)}>
          {prompt.label}
        </Button>
      );
    case "choice":
      return (
        <Question
          selectionMode="single"
          onSubmit={({ selectedValues }) => onAnswer(selectedValues[0])}
          className="bg-card"
        >
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
        <Question
          selectionMode="single"
          onSubmit={({ selectedValues }) => onAnswer(selectedValues[0])}
          className="bg-card"
        >
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
