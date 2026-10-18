import { ItemCard } from "@/components/ItemCard";
import { cn } from "@/lib/utils";
import { formatMonth, type MediaItem, type ResearchItem } from "@/lib/content";

export function ResearchList({ items, wide }: { items: ResearchItem[]; wide?: boolean }) {
  return (
    <div className={cn("grid gap-x-10 gap-y-14 sm:grid-cols-2", !wide && "lg:grid-cols-3")}>
      {items.map((item) => (
        <ItemCard key={item.title} label={item.topic} meta={item.year} {...item} />
      ))}
    </div>
  );
}

export function MediaList({ items, wide }: { items: MediaItem[]; wide?: boolean }) {
  return (
    <div className={cn("grid gap-x-10 gap-y-14 sm:grid-cols-2", !wide && "lg:grid-cols-3")}>
      {items.map((item) => (
        <ItemCard key={item.title} label={item.kind} meta={formatMonth(item.date)} {...item} />
      ))}
    </div>
  );
}

export function TopicList({ topics }: { topics: string[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {topics.map((topic) => (
        <li key={topic} className="rounded-full border bg-card px-4 py-2 font-display text-base">
          {topic}
        </li>
      ))}
    </ul>
  );
}
