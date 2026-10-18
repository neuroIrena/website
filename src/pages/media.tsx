import { mount } from "@/mount";
import { PageTitle } from "@/components/Layout";
import { MediaList } from "@/components/Lists";
import { media } from "@/lib/content";

function Media() {
  return (
    <>
      <PageTitle title="Media" intro={<p>Talks, radio and press about my research.</p>} />
      <MediaList items={media} />
    </>
  );
}

mount(<Media />);
