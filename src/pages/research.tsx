import { mount } from "@/mount";
import { PageTitle } from "@/components/Layout";
import { ResearchList } from "@/components/Lists";
import { profile, research } from "@/lib/content";

function Research() {
  return (
    <>
      <PageTitle
        title="Research"
        intro={
          <p>
            How our bodies, and especially our heartbeats, shape the way we perceive time, ourselves and other people.
            For a full list of publications, see my{" "}
            <a href={profile.links.googleScholar} className="text-foreground decoration-accent decoration-2">
              Google Scholar profile
            </a>
            .
          </p>
        }
      />
      <ResearchList items={research} />
    </>
  );
}

mount(<Research />);
