import { MailIcon, MapPinIcon } from "lucide-react";

import { mount } from "@/mount";
import { PageTitle, SectionHeading } from "@/components/Layout";
import { TopicList } from "@/components/Lists";
import { Button } from "@/components/ui/button";
import { profile, speaking, studyMailto } from "@/lib/content";

function Contact() {
  return (
    <>
      <PageTitle title="Contact" intro={<p>{speaking.contactIntro}</p>} />

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="flex gap-4">
          <MailIcon className="mt-1.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold">Email</h2>
            <a href={`mailto:${profile.email}`} className="decoration-primary decoration-2 break-all">
              {profile.email}
            </a>
          </div>
        </div>
        <div className="flex gap-4">
          <MapPinIcon className="mt-1.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold">Address</h2>
            <address className="not-italic">
              {profile.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </div>
      </div>

      <section className="mt-20 max-w-3xl">
        <SectionHeading title="Take part in a study" />
        <p>
          I regularly run studies on time perception and how we sense our own bodies. If you'd like to take part, send
          me an email and I'll let you know what's coming up.
        </p>
        <Button asChild className="mt-6">
          <a href={studyMailto}>
            <MailIcon aria-hidden="true" />
            Email me about a study
          </a>
        </Button>
      </section>

      <section className="mt-20 max-w-3xl">
        <SectionHeading title="Speaking" />
        <p className="mb-6">{speaking.speakingNote}</p>
        <TopicList topics={speaking.topics} />
      </section>

      <section className="mt-20 max-w-3xl">
        <SectionHeading title="Research collaborations" />
        <p>{speaking.collaborationNote}</p>
      </section>
    </>
  );
}

mount(<Contact />);
