import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/Layout";
import config from "@/content/experiments/feed-time.json";
import { Consent } from "./Consent";
import { Debrief } from "./Debrief";
import { Feed } from "./Feed";
import { Instructions } from "./Instructions";
import { Questions } from "./Questions";
import { saveResponse } from "./save";
import type { Answers, Condition, ExperimentResponse, FeedResult, Step } from "./types";

/** Condition and duration can be forced from the address bar for testing: ?condition=decision&seconds=20 */
function readSettings() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("condition");
  const condition: Condition = forced === "quality" || forced === "decision" ? forced : Math.random() < 0.5 ? "quality" : "decision";
  const seconds = Number(params.get("seconds"));
  const testMode = seconds > 0;
  return {
    condition,
    conditionAssignedBy: (forced ? "url" : "random") as "url" | "random",
    plannedSeconds: testMode ? seconds : config.durationSeconds,
    testMode,
  };
}

export function FeedTimeExperiment() {
  const [settings] = useState(readSettings);
  const [step, setStep] = useState<Step>("landing");
  const timings = useRef<Record<string, number>>({});
  const feedResult = useRef<FeedResult | null>(null);
  const participantId = useRef(crypto.randomUUID());

  const go = (next: Step) => {
    timings.current[next] = Math.round(performance.now());
    setStep(next);
  };

  const onFeedDone = useCallback((result: FeedResult) => {
    feedResult.current = result;
    timings.current.questions = Math.round(performance.now());
    setStep("questions");
  }, []);

  const onAnswers = (answers: Answers) => {
    timings.current.submitted = Math.round(performance.now());
    const response: ExperimentResponse = {
      experiment: "feed-time",
      schemaVersion: 1,
      participantId: participantId.current,
      condition: settings.condition,
      conditionAssignedBy: settings.conditionAssignedBy,
      testMode: settings.testMode,
      plannedSeconds: settings.plannedSeconds,
      scrollPixelsPerSecond: config.scrollPixelsPerSecond,
      feed: feedResult.current!,
      answers,
      timings: { ...timings.current },
      device: {
        userAgent: navigator.userAgent,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        touch: navigator.maxTouchPoints > 0,
      },
      createdAt: new Date().toISOString(),
    };
    void saveResponse(response);
    go("debrief");
  };

  if (step === "feed") {
    return <Feed durationSeconds={settings.plannedSeconds} pixelsPerSecond={config.scrollPixelsPerSecond} onDone={onFeedDone} />;
  }

  return (
    <>
      <PageTitle title={config.title} intro={step === "landing" ? <p>{config.landing.intro}</p> : undefined} />
      {step === "landing" && (
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold">Before you begin, please check:</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {config.landing.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <Button className="mt-8" onClick={() => go("consent")}>
            Read the information sheet
          </Button>
        </div>
      )}
      {step === "consent" && <Consent onConsent={() => go("instructions")} />}
      {step === "instructions" && <Instructions condition={settings.condition} onStart={() => go("feed")} />}
      {step === "questions" && <Questions condition={settings.condition} onSubmit={onAnswers} />}
      {step === "debrief" && <Debrief condition={settings.condition} />}
    </>
  );
}
