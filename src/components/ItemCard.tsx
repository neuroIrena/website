import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="group relative gap-0 overflow-hidden pt-0 shadow-none transition-colors hover:border-primary/40">
      {image && (
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader className="pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant="outline" className="font-display text-muted-foreground">
            {label}
          </Badge>
          <span className="font-display text-sm text-muted-foreground">{meta}</span>
        </div>
        <CardTitle className="mt-1 font-display text-xl leading-tight text-balance">
          <h3>
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="decoration-primary decoration-2 no-underline group-hover:underline after:absolute after:inset-0 after:content-['']"
              >
                {title}
                <ArrowUpRightIcon className="ml-1 inline size-4 align-baseline text-primary" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              title
            )}
          </h3>
        </CardTitle>
      </CardHeader>
      {summary && (
        <CardContent className="pt-2">
          <CardDescription className="text-base leading-relaxed">{summary}</CardDescription>
        </CardContent>
      )}
    </Card>
  );
}
