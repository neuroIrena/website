import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Props = {
  title: string;
  label: string;
  meta: string;
  summary?: string;
  image?: string;
  link?: string;
};

/** One research or media item. Empty summary or link fields simply don't show. */
export function ItemCard({ title, label, meta, summary, image, link }: Props) {
  return (
    <article className="group relative flex flex-col">
      {image && (
        <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Badge>{label}</Badge>
        <span className="font-display text-sm text-muted-foreground">{meta}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="decoration-accent decoration-2 no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {title}
            <ArrowUpRightIcon className="ml-1 inline size-4 align-baseline text-accent" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          title
        )}
      </h3>
      {summary && <p className="mt-2 text-base text-muted-foreground">{summary}</p>}
    </article>
  );
}
