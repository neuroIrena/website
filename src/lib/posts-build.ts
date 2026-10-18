// Build-time only (runs in Node from vite.config.ts, never in the browser).
// Reads the Markdown posts in src/content/posts and writes one real HTML page per post,
// so every post has its own address, title and link preview.

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

import type { Post } from "./post-types";

export const POSTS_DIR = "src/content/posts";

function parse(file: string, text: string): Post {
  const slug = path.basename(file, ".md");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing the --- block at the top`);
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const at = line.indexOf(": ");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 2).trim();
  }
  if (!meta.title) throw new Error(`${file}: needs a title`);
  if (meta.section !== "research" && meta.section !== "media") {
    throw new Error(`${file}: section must be research or media`);
  }
  const body = marked.parse(match[2], { async: false });
  const plain = body
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:!?])/g, "$1")
    .trim();
  const description =
    meta.description || (plain.length > 155 ? plain.slice(0, 155).replace(/\s+\S*$/, "") + "…" : plain);
  const section = meta.section;
  return {
    slug,
    section,
    path: `/${section}/${slug}/`,
    html: `${section}/${slug}/index.html`,
    title: meta.title,
    description,
    image: meta.image,
    source: meta.source,
    sourceLabel: meta.sourceLabel,
    credit: meta.credit,
    body,
  };
}

export function loadPosts(root: string): Post[] {
  const dir = path.join(root, POSTS_DIR);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => parse(f, fs.readFileSync(path.join(dir, f), "utf8")));
}

const template = (post: Post) => `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <!--head-->
  </head>
  <body>
    <!-- Generated from ${POSTS_DIR}/${post.slug}.md. Don't edit; edit the .md file instead. -->
    <div id="root" data-post="${post.slug}"></div>
    <script type="module" src="/src/pages/post.tsx"></script>
  </body>
</html>
`;

/** Writes research/<slug>/index.html and media/<slug>/index.html, and removes stale ones. */
export function writePostPages(root: string, posts: Post[]) {
  const wanted = new Set(posts.map((p) => p.html));
  for (const section of ["research", "media"]) {
    const dir = path.join(root, section);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const html = `${section}/${entry.name}/index.html`;
      if (entry.isDirectory() && !wanted.has(html)) {
        const file = path.join(root, html);
        if (fs.existsSync(file) && fs.readFileSync(file, "utf8").includes("<!-- Generated from")) {
          fs.rmSync(path.join(dir, entry.name), { recursive: true });
        }
      }
    }
  }
  for (const post of posts) {
    const file = path.join(root, post.html);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const content = template(post);
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== content) fs.writeFileSync(file, content);
  }
}
