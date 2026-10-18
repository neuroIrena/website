import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import config from "@/content/experiments/feed-time.json";
import { Scale } from "./Scale";
import type { Answers, Condition } from "./types";

const q = config.questions;

export function Questions({ condition, onSubmit }: { condition: Condition; onSubmit: (a: Answers) => void }) {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [a, setA] = useState<Partial<Answers>>({});
  const set = <K extends keyof Answers>(key: K) => (value: Answers[K]) => setA((x) => ({ ...x, [key]: value }));

  const m = Number(minutes), s = Number(seconds);
  const timeOk = (minutes !== "" || seconds !== "") && m >= 0 && s >= 0 && s < 60 && Number.isFinite(m + s) && m + s > 0;
  const conditionOk =
    condition === "quality" ? a.quality && a.interest : a.choice && a.choiceConfidence;
  const complete = timeOk && a.estimateConfidence && a.checkedClock && a.engagement && conditionOk;

  const submit = () =>
    onSubmit({
      estimateSeconds: m * 60 + s,
      estimateConfidence: a.estimateConfidence!,
      checkedClock: a.checkedClock!,
      engagement: a.engagement!,
      ...(condition === "quality"
        ? { quality: a.quality, interest: a.interest }
        : { choice: a.choice, choiceConfidence: a.choiceConfidence }),
    });

  return (
    <form
      className="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) submit();
      }}
    >
      <h2 className="text-3xl font-semibold">{q.timeHeading}</h2>

      <fieldset className="mt-8 space-y-3">
        <legend className="font-display text-lg font-medium">{q.timePrompt}</legend>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="est-min">Minutes</Label>
            <Input id="est-min" type="number" inputMode="numeric" min={0} max={120} className="h-11 w-28 text-base" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="est-sec">Seconds</Label>
            <Input id="est-sec" type="number" inputMode="numeric" min={0} max={59} className="h-11 w-28 text-base" value={seconds} onChange={(e) => setSeconds(e.target.value)} />
          </div>
        </div>
      </fieldset>

      <div className="mt-8">
        <Scale prompt={q.confidencePrompt} low="Not at all" high="Completely" value={a.estimateConfidence} onChange={set("estimateConfidence")} />
      </div>

      <fieldset className="mt-8 space-y-3">
        <legend className="font-display text-lg font-medium">{q.checkedClockPrompt}</legend>
        <RadioGroup value={a.checkedClock ?? ""} onValueChange={(v) => set("checkedClock")(v as "yes" | "no")} className="flex gap-6">
          {(["no", "yes"] as const).map((v) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem id={`clock-${v}`} value={v} className="size-5" />
              <Label htmlFor={`clock-${v}`} className="text-base font-normal capitalize">{v}</Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <Separator className="my-10" />

      {condition === "quality" ? (
        <>
          <h2 className="text-3xl font-semibold">{q.quality.heading}</h2>
          <div className="mt-8 space-y-8">
            <Scale prompt={q.quality.qualityPrompt} low={q.quality.scaleLow} high={q.quality.scaleHigh} value={a.quality} onChange={set("quality")} />
            <Scale prompt={q.quality.interestPrompt} low={q.quality.interestLow} high={q.quality.interestHigh} value={a.interest} onChange={set("interest")} />
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-semibold">{q.decision.heading}</h2>
          <fieldset className="mt-8 space-y-3">
            <legend className="font-display text-lg font-medium">{q.decision.choicePrompt}</legend>
            <RadioGroup value={a.choice ?? ""} onValueChange={set("choice")} className="flex gap-6">
              {q.decision.options.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem id={`choice-${opt}`} value={opt} className="size-5" />
                  <Label htmlFor={`choice-${opt}`} className="text-base font-normal">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          <div className="mt-8">
            <Scale prompt={q.decision.confidencePrompt} low={q.decision.scaleLow} high={q.decision.scaleHigh} value={a.choiceConfidence} onChange={set("choiceConfidence")} />
          </div>
        </>
      )}

      <div className="mt-8">
        <Scale prompt={q.engagementPrompt} low={q.engagementLow} high={q.engagementHigh} value={a.engagement} onChange={set("engagement")} />
      </div>

      <Button type="submit" className="mt-10" disabled={!complete}>
        {q.button}
      </Button>
      {!complete && <p className="mt-3 text-sm text-muted-foreground">Please answer every question to continue.</p>}
    </form>
  );
}
