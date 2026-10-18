import { mount } from "@/mount";
import { ItemCard } from "@/components/ItemCard";
import { PageTitle } from "@/components/Layout";
import { experiments } from "@/lib/content";

function Experiments() {
  return (
    <>
      <PageTitle
        title="Experiments"
        intro={
          <p>
            Short online studies you can take part in from your own device. Each one takes a few minutes, collects no
            personal information, and explains what it was about at the end.
          </p>
        }
      />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((e) => (
          <ItemCard
            key={e.slug}
            title={e.title}
            label={e.status === "open" ? "Open" : "Closed"}
            meta={`About ${e.minutes} minutes`}
            summary={e.summary}
            image={e.image}
            href={`/experiments/${e.slug}/`}
          />
        ))}
      </div>
    </>
  );
}

mount(<Experiments />);
