import { useCallback, useEffect, useRef, useState } from "react";

import config from "@/content/experiments/feed-time.json";
import { ChatView } from "./chat/ChatView";
import { useConversation } from "./chat/useConversation";
import { Feed } from "./Feed";
import { saveResponse } from "./save";
import type { Answers, Condition, ExperimentResponse, FeedResult } from "./types";

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

/** A message with a bold heading, for the information sheet sections. */
const section = (heading: string, body: string) => ({
  text: body,
  render: (
    <>
      <span className="block font-display font-semibold">{heading}</span>
      {body}
    </>
  ),
});

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

    async function run() {
      // Welcome and checks
      await say(config.landing.messages);
      if ((await ask(yesNo(config.landing.yes, config.landing.no))) === "no") {
        await say([c.declined]);
        return;
      }
      mark("consent");

      // Information sheet, one section per message
      await say([c.intro]);
      await say([
        section("Study", `${config.title}. Researcher: ${config.researcher}, ${config.institution}. Ethics approval: ${config.ethicsReference}. ${config.version}.`),
        ...c.sections.map((s) => section(s.heading, s.body)),
        section(
          "Contacts",
          `Researcher: ${config.contactEmail}. Ethics committee: ${config.ethicsContact}. Data Protection Officer: ${config.dataProtectionContact}. Data retention: ${config.retentionYears}.`,
        ),
      ]);

      // Consent, one statement at a time
      await say([c.afterSections]);
      for (const statement of c.statements) {
        await say([statement]);
        if ((await ask(yesNo(c.agree, c.decline))) === "no") {
          await say([c.declined]);
          return;
        }
      }
      mark("instructions");

      // Instructions and the condition's goal
      await say([
        ...config.instructions.common,
        {
          text: config.instructions.conditions[condition].goal,
          render: (
            <span className="block rounded-lg border border-primary/40 bg-background px-4 py-3">
              <span className="block font-display text-sm text-muted-foreground">Your task</span>
              {config.instructions.conditions[condition].goal}
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
        scrollPixelsPerSecond: config.scrollPixelsPerSecond,
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

      // Debrief
      await say([
        ...config.debrief.paragraphs,
        `You were in the "${config.instructions.conditions[condition].label}" group.`,
        config.debrief.sharePrompt,
      ]);
    }

    void run();
    // The script runs once, on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[440px] flex-col py-4 sm:h-[calc(100dvh-7.5rem)]">
      <h1 className="sr-only">{config.title}</h1>
      {showFeed ? (
        <Feed durationSeconds={settings.plannedSeconds} pixelsPerSecond={config.scrollPixelsPerSecond} onDone={onFeedDone} />
      ) : (
        <ChatView entries={chat.entries} typing={chat.typing} prompt={chat.prompt} onAnswer={chat.answer} />
      )}
    </div>
  );
}
