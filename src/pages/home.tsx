import { ArrowRightIcon, MailIcon } from "lucide-react";

import { mount } from "@/mount";
import { HeartbeatTrace } from "@/components/HeartbeatTrace";
import { SectionHeading } from "@/components/Layout";
import { MediaList, ResearchList, TopicList } from "@/components/Lists";
import { Button } from "@/components/ui/button";
import { media, profile, research, speaking, studyMailto } from "@/lib/content";

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 font-display text-base decoration-accent decoration-2 hover:text-accent">
      {label}
      <ArrowRightIcon className="size-4" aria-hidden="true" />
    </a>
  );
}

function Home() {
  const [first, ...rest] = profile.name.split(" ");
  return (
    <>
      <section aria-labelledby="name" className="pt-8 sm:pt-14">
        <h1
          id="name"
          className="text-[clamp(3.5rem,14vw,10.5rem)] leading-[0.88] font-bold tracking-[-0.035em]"
        >
          {first}
          <br />
          {rest.join(" ")}
        </h1>
        <HeartbeatTrace className="mt-5 h-12 w-full text-trace sm:mt-8 sm:h-20" />
        <ul className="mt-5 flex flex-wrap gap-x-2 font-display text-lg text-muted-foreground">
          {profile.fields.map((field, i) => (
            <li key={field}>
              {field}
              {i < profile.fields.length - 1 && <span aria-hidden="true" className="ml-2">·</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-12 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-16 lg:mt-20">
        <div className="max-w-2xl">
          <p className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{profile.headline}</p>
          <div className="mt-6 space-y-5">
            {profile.bio.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href={studyMailto}>
                <MailIcon aria-hidden="true" />
                Take part in a study
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/contact/">Get in touch</a>
            </Button>
          </div>
        </div>
        <div className="mx-auto aspect-square w-64 overflow-hidden rounded-full bg-muted sm:w-80 md:mx-0 md:w-full">
          <img
            src={profile.portrait}
            alt={`${profile.name} giving a talk`}
            className="h-full w-full scale-[1.42] object-cover"
          />
        </div>
      </section>

      <section className="mt-24">
        <SectionHeading title="Research" action={<SeeAll href="/research/" label="All research" />} />
        <ResearchList items={research.slice(0, 2)} wide />
      </section>

      <section className="mt-24">
        <SectionHeading title="Media" action={<SeeAll href="/media/" label="All media" />} />
        <MediaList items={media.slice(0, 2)} wide />
      </section>

      <section className="mt-24">
        <SectionHeading title="Speaking" />
        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <p className="max-w-xl">{speaking.speakingNote}</p>
          <TopicList topics={speaking.topics} />
        </div>
      </section>
    </>
  );
}

mount(<Home />);
