import { useId } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type Props = {
  prompt: string;
  low: string;
  high: string;
  value?: number;
  onChange: (value: number) => void;
  points?: number;
};

/** A numbered rating scale (1 to 7 by default) with a label at each end. */
export function Scale({ prompt, low, high, value, onChange, points = 7 }: Props) {
  const id = useId();
  const steps = Array.from({ length: points }, (_, i) => i + 1);
  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-lg font-medium">{prompt}</legend>
      <RadioGroup
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        aria-label={prompt}
        className="flex flex-wrap gap-2"
      >
        {steps.map((n) => {
          const itemId = `${id}-${n}`;
          const selected = value === n;
          return (
            <Label
              key={n}
              htmlFor={itemId}
              className={cn(
                "flex size-11 cursor-pointer items-center justify-center rounded-full border bg-card font-display text-base transition-colors has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50",
                selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40",
              )}
            >
              <RadioGroupItem id={itemId} value={String(n)} className="sr-only" />
              {n}
            </Label>
          );
        })}
      </RadioGroup>
      <div className="flex justify-between font-display text-sm text-muted-foreground" aria-hidden="true">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </fieldset>
  );
}
