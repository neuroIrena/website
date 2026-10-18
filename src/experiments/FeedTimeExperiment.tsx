import { useCallback, useEffect, useRef, useState } from "react";

import config from "@/content/experiments/feed-time.json";
import { ChatView } from "./chat/ChatView";
import { useConversation } from "./chat/useConversation";
import { Feed } from "./Feed";
import { saveResponse } from "./save";
import type { Answers, Condition, ExperimentResponse, FeedResult, ScrollSettings } from "./types";

/** Condition and duration can be forced from the address bar for testing: ?condition=decision&seconds=10 */
function readSettings() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("condition");
  const condition: Condition =
    forced === "quality" || forced === "decision" ? forced : Math.random() < 0.5 ? "quality" : "decision";
  const seconds = Number(params.get("seconds"));
  const testMode = seconds > 0;
  return {
    condition,
    conditionAssignedBy: (forced ? "url" : "random") as "url" | "random",
    plannedSeconds: testMode ? seconds : config.durationSeconds,
    testMode,
  };
}

const yesNo = (yes: string, no: string) => ({
  kind: "buttons" as const,
  options: [
    { label: yes, value: "yes" },
    { label: no, value: "no" },
  ],
});

/** The participant information sheet as one message, headings and all. */
function InformationSheet() {
  const c = config.consent;
  return (
    <div className="space-y-5 rounded-lg border bg-card p-5 sm:p-6">
      <h2 className="text-2xl font-semibold">{c.heading}</h2>
      <dl className="grid gap-x-6 gap-y-1 text-base text-muted-foreground sm:grid-cols-[auto_1fr]">
        <dt className="font-display">Study</dt>
        <dd>{config.title}</dd>
        <dt className="font-display">Researcher</dt>
        <dd>
          {config.researcher}, {config.institution}
        </dd>
        <dt className="font-display">Ethics approval</dt>
        <dd>{config.ethicsReference}</dd>
        <dt className="font-display">Version</dt>
        <dd>{config.version}</dd>
      </dl>
      {c.sections.map((s) => (
        <section key={s.heading}>
          <h3 className="font-display text-lg font-semibold">{s.heading}</h3>
          <p className="mt-1">{s.body}</p>
        </section>
      ))}
      <section>
        <h3 className="font-display text-lg font-semibold">Contacts</h3>
        <ul className="mt-1 space-y-1">
          <li>
            Researcher:{" "}
            <a href={`mailto:${config.contactEmail}`} className="decoration-primary decoration-2">
              {config.contactEmail}
            </a>
          </li>
          <li>Ethics committee: {config.ethicsContact}</li>
          <li>Data Protection Officer: {config.dataProtectionContact}</li>
          <li>Data retention: {config.retentionYears}</li>
        </ul>
      </section>
    </div>
  );
}

export function FeedTimeExperiment() {
  const [settings] = useState(readSettings);
  const chat = useConversation();
  const [showFeed, setShowFeed] = useState(false);
  const feedDone = useRef<((r: FeedResult) => void) | null>(null);
  const timings = useRef<Record<string, number>>({});
  const participantId = useRef(crypto.randomUUID());
  const started = useRef(false);

  const mark = (name: string) => {
    timings.current[name] = Math.round(performance.now());
  };

  const onFeedDone = useCallback((result: FeedResult) => {
    setShowFeed(false);
    feedDone.current?.(result);
    feedDone.current = null;
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const { say, ask } = chat;
    const { condition } = settings;
    const c = config.consent;
    const q = config.questions;
    const goal = config.instructions.conditions[condition].goal;

    async function run() {
      // Welcome and checks
      await say(config.landing.messages);
      if ((await ask(yesNo(config.landing.yes, config.landing.no))) === "no") {
        await say([c.declined]);
        return;
      }
      mark("consent");

      // Information sheet, then the consent checklist
      await say([c.intro, { text: c.sections.map((s) => s.body).join(" "), render: <InformationSheet /> }]);
      if ((await ask({ kind: "consent", statements: c.statements, agree: c.button, decline: c.decline })) === "no") {
        await say([c.declined]);
        return;
      }
      mark("instructions");

      // Instructions and the condition's goal
      await say([
        ...config.instructions.common,
        {
          text: goal,
          render: (
            <span className="block rounded-lg border border-primary/40 bg-card px-4 py-3">
              <span className="block font-display text-sm text-muted-foreground">Your task</span>
              {goal}
            </span>
          ),
        },
        config.instructions.ready,
      ]);
      await ask({ kind: "action", label: config.instructions.button });

      // The feed
      mark("feed");
      const feed = await new Promise<FeedResult>((resolve) => {
        feedDone.current = resolve;
        setShowFeed(true);
      });
      mark("questions");

      // Questions
      await say([q.afterFeed, q.timePrompt]);
      const estimateSeconds = Number(await ask({ kind: "duration", submit: q.send }));
      await say([q.confidencePrompt]);
      const estimateConfidence = Number(await ask({ kind: "scale", low: "Not at all", high: "Completely", submit: q.send }));
      await say([q.checkedClockPrompt]);
      const checkedClock = (await ask(yesNo("No", "Yes"))) === "yes" ? "no" : "yes";

      const answers: Answers = { estimateSeconds, estimateConfidence, checkedClock, engagement: 0 };
      if (condition === "quality") {
        await say([q.quality.qualityPrompt]);
        answers.quality = Number(await ask({ kind: "scale", low: q.quality.scaleLow, high: q.quality.scaleHigh, submit: q.send }));
        await say([q.quality.interestPrompt]);
        answers.interest = Number(await ask({ kind: "scale", low: q.quality.interestLow, high: q.quality.interestHigh, submit: q.send }));
      } else {
        await say([q.decision.choicePrompt]);
        answers.choice = await ask({ kind: "choice", options: q.decision.options, submit: q.send });
        await say([q.decision.confidencePrompt]);
        answers.choiceConfidence = Number(await ask({ kind: "scale", low: q.decision.scaleLow, high: q.decision.scaleHigh, submit: q.send }));
      }
      await say([q.engagementPrompt]);
      answers.engagement = Number(await ask({ kind: "scale", low: q.engagementLow, high: q.engagementHigh, submit: q.send }));
      mark("submitted");

      const response: ExperimentResponse = {
        experiment: "feed-time",
        schemaVersion: 1,
        participantId: participantId.current,
        condition,
        conditionAssignedBy: settings.conditionAssignedBy,
        testMode: settings.testMode,
        plannedSeconds: settings.plannedSeconds,
        scroll: config.scroll as ScrollSettings,
        feed,
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

      // Debrief: one message, then the sign-off
      const label = config.instructions.conditions[condition].label;
      await say([
        [...config.debrief.paragraphs, `You were in the "${label}" group.`].join("\n\n"),
        config.debrief.sharePrompt,
      ]);
      void ask({ kind: "link", label: "Exit study", href: "/experiments/" });
    }

    void run();
    // The script runs once, on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 className="sr-only">{config.title}</h1>
      <ChatView entries={chat.entries} typing={chat.typing} prompt={chat.prompt} onAnswer={chat.answer}>
        {showFeed && <Feed durationSeconds={settings.plannedSeconds} scroll={config.scroll as ScrollSettings} onDone={onFeedDone} />}
      </ChatView>
    </>
  );
}
