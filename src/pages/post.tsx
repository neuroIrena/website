import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import posts from "virtual:posts";

import { mount } from "@/mount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMonth, media, research } from "@/lib/content";

const slug = document.getElementById("root")?.dataset.post;
const post = posts.find((p) => p.slug === slug)!;

/** The matching card from research.json or media.json, for the label and date. */
function cardInfo() {
  if (post.section === "research") {
    const item = research.find((r) => r.post === post.slug);
    return item && { label: item.topic, meta: item.year };
  }
  const item = media.find((m) => m.post === post.slug);
  return item && { label: item.kind, meta: formatMonth(item.date) };
}

function Post() {
  const info = cardInfo();
  const back = post.section === "research" ? { href: "/research/", label: "Research" } : { href: "/media/", label: "Media" };
  return (
    <article className="mx-auto max-w-3xl pt-8 sm:pt-12">
      <a
        href={back.href}
        className="inline-flex items-center gap-1.5 font-display text-base text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {back.label}
      </a>

      {info && (
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant="outline" className="font-display text-muted-foreground">
            {info.label}
          </Badge>
          <span className="font-display text-sm text-muted-foreground">{info.meta}</span>
        </div>
      )}
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{post.title}</h1>
      {post.credit && <p className="mt-4 text-muted-foreground">{post.credit}</p>}

      {post.image && (
        <div className="mt-10 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
          <img src={post.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="post-body mt-10" dangerouslySetInnerHTML={{ __html: post.body }} />

      {post.source && (
        <>
          <Separator className="my-10" />
          <Button asChild className="h-auto min-h-11 py-2.5 text-left whitespace-normal">
            <a href={post.source} target="_blank" rel="noopener noreferrer">
              {post.sourceLabel ?? "Read more"}
              <ArrowUpRightIcon aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </>
      )}
    </article>
  );
}

mount(<Post />);
