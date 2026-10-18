export type Condition = "quality" | "decision";

export type ScrollSettings = {
  mode: "stepped" | "continuous";
  /** Stepped mode: seconds to rest on each post, cycled in order so everyone gets the same sequence. */
  dwellSeconds: number[];
  /** Stepped mode: how long the flick to the next post takes. */
  flickMs: number;
  /** Continuous mode: scroll speed. */
  pixelsPerSecond: number;
};

/** What the feed task reports back when the time is up. */
export type FeedResult = {
  /** Seconds the feed was actually on screen, measured with performance.now(). */
  actualSeconds: number;
  /** How far the feed scrolled, in CSS pixels. */
  scrolledPixels: number;
  /** Whether the tab lost visibility (participant switched away) during the task. */
  hiddenDuringTask: boolean;
  /** Ids of the posts in the order shown. */
  postOrder: string[];
  /** How many posts were rested on (stepped mode) or rendered (continuous). */
  postsShown: number;
};

export type Answers = {
  estimateSeconds: number;
  estimateConfidence: number;
  checkedClock: "yes" | "no";
  engagement: number;
  /** Condition "quality" only. */
  quality?: number;
  interest?: number;
  /** Condition "decision" only. */
  choice?: string;
  choiceConfidence?: number;
};

/** One complete, anonymous response. This is the shape that will be saved. */
export type ExperimentResponse = {
  experiment: "feed-time";
  schemaVersion: 1;
  participantId: string;
  condition: Condition;
  conditionAssignedBy: "random" | "url";
  /** True when the duration was overridden from the address bar for testing. */
  testMode: boolean;
  plannedSeconds: number;
  /** How the feed moved: "stepped" rests on each post then flicks to the next, "continuous" glides. */
  scroll: ScrollSettings;
  feed: FeedResult;
  answers: Answers;
  /** Milliseconds since the page loaded, for each step boundary. */
  timings: Record<string, number>;
  device: {
    userAgent: string;
    viewportWidth: number;
    viewportHeight: number;
    pixelRatio: number;
    reducedMotion: boolean;
    touch: boolean;
  };
  createdAt: string;
};
