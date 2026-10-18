import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import config from "@/content/experiments/feed-time.json";
import type { Condition } from "./types";

const c = config.instructions;

export function Instructions({ condition, onStart }: { condition: Condition; onStart: () => void }) {
  return (
    <article className="max-w-3xl">
      <h2 className="text-3xl font-semibold">Before you start</h2>
      <div className="mt-6 space-y-4">
        {c.common.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Card className="mt-8 border-primary/40 shadow-none">
        <CardContent>
          <p className="font-display text-sm text-muted-foreground">Your task</p>
          <p className="mt-2 text-xl leading-snug">{c.conditions[condition].goal}</p>
        </CardContent>
      </Card>
      <p className="mt-8 text-muted-foreground">
        The feed will fill your screen. When it finishes, the questions appear automatically.
      </p>
      <Button className="mt-6" onClick={onStart}>
        {c.button}
      </Button>
    </article>
  );
}
