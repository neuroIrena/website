import { ItemCard } from "@/components/ItemCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMonth, type MediaItem, type ResearchItem } from "@/lib/content";

const postHref = (section: string, post?: string) => (post ? `/${section}/${post}/` : undefined);

export function ResearchList({ items, wide }: { items: ResearchItem[]; wide?: boolean }) {
  return (
    <div className={cn("grid gap-8 sm:grid-cols-2", !wide && "lg:grid-cols-3")}>
      {items.map((item) => (
        <ItemCard key={item.title} label={item.topic} meta={item.year} href={postHref("research", item.post)} {...item} />
      ))}
    </div>
  );
}

export function MediaList({ items, wide }: { items: MediaItem[]; wide?: boolean }) {
  return (
    <div className={cn("grid gap-8 sm:grid-cols-2", !wide && "lg:grid-cols-3")}>
      {items.map((item) => (
        <ItemCard key={item.title} label={item.kind} meta={formatMonth(item.date)} href={postHref("media", item.post)} {...item} />
      ))}
    </div>
  );
}

export function TopicList({ topics }: { topics: string[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {topics.map((topic) => (
        <li key={topic}>
          <Badge variant="outline" className="bg-card px-4 py-2 font-display text-base font-normal">
            {topic}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
