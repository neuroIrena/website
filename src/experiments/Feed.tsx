import { useEffect, useMemo, useRef } from "react";
import { BookmarkIcon, HeartIcon, MapPinIcon, MessageCircleIcon, SendIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import posts from "@/content/experiments/feed-posts.json";
import type { FeedResult, ScrollSettings } from "./types";

type Post = (typeof posts)[number];

type Props = {
  durationSeconds: number;
  scroll: ScrollSettings;
  onDone: (result: FeedResult) => void;
};

/** Rough height of one post card at the feed's width, used only to decide how many to render. */
const APPROX_CARD_HEIGHT = 660;
/** Gap above a post when the feed rests on it, in CSS pixels. */
const REST_OFFSET = 16;

const formatLikes = (n: number) => n.toLocaleString("en-GB");
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2);

/**
 * An Instagram-style feed that moves by itself for a fixed time and covers the whole page
 * while it runs. In "stepped" mode it rests on one post, flicks to the next, rests again,
 * like a person scrolling. In "continuous" mode it glides at a constant speed.
 * The participant cannot scroll, pause or click anything.
 */
export function Feed({ durationSeconds, scroll, onDone }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);

  // Repeat the pool, in its fixed order, until there is enough to get through the time.
  const items = useMemo(() => {
    const perPost =
      scroll.mode === "stepped"
        ? scroll.dwellSeconds.reduce((a, b) => a + b, 0) / scroll.dwellSeconds.length + scroll.flickMs / 1000
        : APPROX_CARD_HEIGHT / scroll.pixelsPerSecond;
    const needed = Math.ceil(durationSeconds / perPost) + 3;
    return Array.from({ length: needed }, (_, i) => ({ ...posts[i % posts.length], key: i }));
  }, [durationSeconds, scroll]);

  // Lock the page behind the feed so nothing else can be scrolled to.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let cancelled = false;
    let hidden = false;
    const onVisibility = () => {
      if (document.hidden) hidden = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Stepped mode: where each post sits, and when each rest starts.
    const tops = cards.current.map((c) => Math.max(0, (c?.offsetTop ?? 0) - REST_OFFSET));
    const starts: number[] = [0];
    for (let i = 0; i < tops.length; i++) {
      starts.push(starts[i] + scroll.dwellSeconds[i % scroll.dwellSeconds.length] * 1000 + scroll.flickMs);
    }
    let restedOn = 1;

    const positionAt = (elapsed: number) => {
      if (scroll.mode === "continuous") return (elapsed / 1000) * scroll.pixelsPerSecond;
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1] <= elapsed) i++;
      restedOn = Math.max(restedOn, i + 1);
      const dwell = scroll.dwellSeconds[i % scroll.dwellSeconds.length] * 1000;
      const into = elapsed - starts[i] - dwell;
      const from = tops[i] ?? 0;
      const to = tops[i + 1] ?? from;
      if (into <= 0) return from;
      return from + (to - from) * easeInOut(Math.min(1, into / scroll.flickMs));
    };

    let frame = 0;
    let start = 0;
    const durationMs = durationSeconds * 1000;

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const elapsed = now - start;
      el.scrollTop = positionAt(elapsed);
      if (elapsed < durationMs) {
        frame = requestAnimationFrame(tick);
        return;
      }
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      onDone({
        actualSeconds: elapsed / 1000,
        scrolledPixels: el.scrollTop,
        hiddenDuringTask: hidden,
        postOrder: items.map((p: Post & { key: number }) => p.id),
        postsShown: scroll.mode === "stepped" ? restedOn : items.length,
      });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [durationSeconds, scroll, items, onDone]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-hidden bg-background" role="region" aria-label="Social media feed, scrolling automatically">
      <div
        ref={scroller}
        className="w-full max-w-[470px] overflow-hidden"
        style={{ touchAction: "none" }}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="flex flex-col gap-4 py-4 select-none">
          {items.map((post, i) => (
            <div
              key={post.key}
              ref={(node) => {
                cards.current[i] = node;
              }}
            >
              <FeedPost post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedPost({ post }: { post: Post }) {
  return (
    <Card className="pointer-events-none gap-0 overflow-hidden rounded-xl py-0 shadow-none">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="size-8 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
        <span className="font-display text-sm font-semibold">{post.user}</span>
      </div>
      <div className="relative">
        <img src={post.image} alt="" width={800} height={800} className="aspect-square w-full bg-muted object-cover" />
        {"location" in post && post.location && (
          <Badge className="absolute bottom-3 left-3 gap-1 rounded-full bg-background/85 px-3 py-1.5 font-display text-sm font-medium text-foreground backdrop-blur-sm">
            <MapPinIcon className="size-4 text-primary" aria-hidden="true" />
            {post.location}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4 px-4 pt-3 text-foreground">
        <HeartIcon className="size-6" aria-hidden="true" />
        <MessageCircleIcon className="size-6" aria-hidden="true" />
        <SendIcon className="size-6" aria-hidden="true" />
        <BookmarkIcon className="ml-auto size-6" aria-hidden="true" />
      </div>
      <div className="px-4 pt-2 pb-4 text-base leading-snug">
        <p className="font-display text-sm font-semibold">{formatLikes(post.likes)} likes</p>
        <p className="mt-1">
          <span className="font-display text-sm font-semibold">{post.user}</span> {post.caption}
        </p>
      </div>
    </Card>
  );
}
