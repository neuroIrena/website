import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import config from "@/content/experiments/feed-time.json";

const c = config.consent;

export function Consent({ onConsent }: { onConsent: () => void }) {
  const [ticked, setTicked] = useState<boolean[]>(() => c.statements.map(() => false));
  const all = ticked.every(Boolean);

  return (
    <article className="max-w-3xl">
      <h2 className="text-3xl font-semibold">{c.heading}</h2>
      <dl className="mt-4 grid gap-x-6 gap-y-1 text-base text-muted-foreground sm:grid-cols-[auto_1fr]">
        <dt className="font-display">Study</dt>
        <dd>{config.title}</dd>
        <dt className="font-display">Researcher</dt>
        <dd>
          {config.researcher}, {config.institution}
        </dd>
        <dt className="font-display">Ethics approval</dt>
        <dd>{config.ethicsReference}</dd>
        <dt className="font-display">Version</dt>
        <dd>{config.version}</dd>
      </dl>

      <div className="mt-8 space-y-6">
        {c.sections.map((s) => (
          <section key={s.heading}>
            <h3 className="text-xl font-semibold">{s.heading}</h3>
            <p className="mt-2">{s.body}</p>
          </section>
        ))}
        <section>
          <h3 className="text-xl font-semibold">Contacts</h3>
          <ul className="mt-2 space-y-1">
            <li>
              Researcher:{" "}
              <a href={`mailto:${config.contactEmail}`} className="decoration-primary decoration-2">
                {config.contactEmail}
              </a>
            </li>
            <li>Ethics committee: {config.ethicsContact}</li>
            <li>Data Protection Officer: {config.dataProtectionContact}</li>
            <li>Data retention: {config.retentionYears}</li>
          </ul>
        </section>
      </div>

      <Separator className="my-10" />

      <h3 className="text-xl font-semibold">Consent</h3>
      <p className="mt-2 text-muted-foreground">Please tick every statement to confirm you agree with it.</p>
      <ul className="mt-6 space-y-4">
        {c.statements.map((text, i) => {
          const id = `consent-${i}`;
          return (
            <li key={id} className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={ticked[i]}
                onCheckedChange={(v) => setTicked((t) => t.map((x, j) => (j === i ? v === true : x)))}
                className="mt-1.5 size-5"
              />
              <Label htmlFor={id} className="text-base leading-relaxed font-normal">
                {text}
              </Label>
            </li>
          );
        })}
      </ul>
      <Button className="mt-8" disabled={!all} onClick={onConsent}>
        {c.button}
      </Button>
      {!all && (
        <p className="mt-3 text-sm text-muted-foreground">
          If you don't want to take part, simply close this page. Nothing has been recorded.
        </p>
      )}
    </article>
  );
}
