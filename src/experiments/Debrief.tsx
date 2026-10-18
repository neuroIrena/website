import config from "@/content/experiments/feed-time.json";
import type { Condition } from "./types";

const d = config.debrief;

export function Debrief({ condition }: { condition: Condition }) {
  return (
    <article className="max-w-3xl">
      <h2 className="text-3xl font-semibold">{d.heading}</h2>
      <div className="mt-6 space-y-4">
        {d.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="text-muted-foreground">
          You were in the "{config.instructions.conditions[condition].label}" group. Questions or results:{" "}
          <a href={`mailto:${config.contactEmail}`} className="decoration-primary decoration-2">
            {config.contactEmail}
          </a>
          .
        </p>
        <p className="font-display font-medium">{d.sharePrompt}</p>
      </div>
    </article>
  );
}
