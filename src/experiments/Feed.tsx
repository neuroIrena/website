import { useEffect, useMemo, useRef } from "react";
import { BookmarkIcon, HeartIcon, MessageCircleIcon, SendIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import posts from "@/content/experiments/feed-posts.json";
import type { FeedResult } from "./types";

type Post = (typeof posts)[number];

type Props = {
  durationSeconds: number;
  pixelsPerSecond: number;
  onDone: (result: FeedResult) => void;
};

/** Rough height of one post card at the feed's width, used only to decide how many to render. */
const APPROX_CARD_HEIGHT = 640;

const formatLikes = (n: number) => n.toLocaleString("en-GB");

/**
 * An Instagram-style feed that scrolls by itself at a constant speed for a fixed time.
 * It covers the whole page while it runs. The participant cannot scroll, pause or click anything.
 */
export function Feed({ durationSeconds, pixelsPerSecond, onDone }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  // Repeat the pool, in its fixed order, until there is enough to scroll through.
  const items = useMemo(() => {
    const needed = Math.ceil((durationSeconds * pixelsPerSecond) / APPROX_CARD_HEIGHT) + 4;
    return Array.from({ length: needed }, (_, i) => ({ ...posts[i % posts.length], key: i }));
  }, [durationSeconds, pixelsPerSecond]);

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

    let frame = 0;
    let start = 0;
    const durationMs = durationSeconds * 1000;

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const elapsed = now - start;
      el.scrollTop = (elapsed / 1000) * pixelsPerSecond;
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
      });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [durationSeconds, pixelsPerSecond, items, onDone]);

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
          {items.map((post) => (
            <FeedPost key={post.key} post={post} />
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
        <span className="size-8 rounded-full bg-primary/70" aria-hidden="true" />
        <span className="font-display text-sm font-semibold">{post.user}</span>
      </div>
      <img src={post.image} alt="" width={800} height={800} className="aspect-square w-full bg-muted object-cover" />
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
