import { DownloadIcon, GraduationCapIcon } from "lucide-react";

import { mount } from "@/mount";
import { PageTitle, SectionHeading } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { cv, profile } from "@/lib/content";

type Entry = { years: string; role: string; place: string };

function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <ol className="space-y-6">
      {entries.map((entry) => (
        <li key={entry.role + entry.years} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-8">
          <span className="font-display text-base text-muted-foreground tabular-nums">{entry.years}</span>
          <div>
            <p className="font-display text-xl font-semibold">{entry.role}</p>
            <p className="text-muted-foreground">{entry.place}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CV() {
  return (
    <>
      <PageTitle title="CV" />
      <div className="-mt-4 mb-16 flex flex-wrap gap-3">
        <Button asChild>
          <a href={profile.cvPdf} download="Irena-Arslanova-CV.pdf">
            <DownloadIcon aria-hidden="true" />
            Download CV (PDF)
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={profile.links.googleScholar}>
            <GraduationCapIcon aria-hidden="true" />
            Google Scholar
          </a>
        </Button>
      </div>
      <div className="max-w-3xl space-y-16">
        <section>
          <SectionHeading title="Positions" />
          <Timeline entries={cv.positions} />
        </section>
        <section>
          <SectionHeading title="Education" />
          <Timeline entries={cv.education} />
        </section>
      </div>
    </>
  );
}

mount(<CV />);
