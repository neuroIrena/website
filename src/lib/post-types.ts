export type Post = {
  slug: string;
  section: "research" | "media";
  /** Public address, e.g. /research/tedx-berlin/ */
  path: string;
  /** Generated HTML file for this post, relative to the project root. */
  html: string;
  title: string;
  description: string;
  image?: string;
  source?: string;
  sourceLabel?: string;
  credit?: string;
  /** The post text, already turned from Markdown into HTML. */
  body: string;
};
