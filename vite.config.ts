import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import site from "./src/content/site.json";
import experiments from "./src/content/experiments.json";
import { loadPosts, POSTS_DIR, writePostPages } from "./src/lib/posts-build";

const root = fileURLToPath(new URL(".", import.meta.url));

let posts = loadPosts(root);
writePostPages(root, posts);

// Each experiment has its own page under /experiments/<slug>/. They are kept out of search results.
const experimentPages = experiments.map((e) => ({
  id: `experiment-${e.slug}`,
  path: `/experiments/${e.slug}/`,
  html: `experiments/${e.slug}/index.html`,
  title: `${e.title} | ${site.name}`,
  description: e.summary,
  image: e.image,
}));

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Fills the <!--head--> placeholder in each page's HTML with its title,
// description, canonical URL and social preview tags, from site.json or the post file.
function pageHead(): Plugin {
  return {
    name: "page-head",
    transformIndexHtml(html, ctx) {
      const file = ctx.path.replace(/^\//, "");
      const experiment = experimentPages.find((p) => p.html === file);
      const page = site.pages.find((p) => p.html === file) ?? experiment;
      const post = posts.find((p) => p.html === file);
      if (!page && !post) {
        throw new Error(`No entry in src/content/site.json, src/content/experiments.json or ${POSTS_DIR} for ${file}`);
      }
      const url = site.url + (page ? page.path : post!.path);
      const image = site.url + (post?.image ?? experiment?.image ?? site.ogImage);
      const title = escape(page ? page.title : `${post!.title} | ${site.name}`);
      const desc = escape(page ? page.description : post!.description);
      const head = [
        `<title>${title}</title>`,
        `<meta name="description" content="${desc}" />`,
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="${post ? "article" : "website"}" />`,
        `<meta property="og:site_name" content="${escape(site.name)}" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${desc}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${image}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${desc}" />`,
        `<meta name="twitter:image" content="${image}" />`,
        ...(experiment ? [`<meta name="robots" content="noindex" />`] : []),
      ].join("\n    ");
      return html.replace("<!--head-->", head);
    },
  };
}

// Makes the posts available to the pages as `import posts from "virtual:posts"`,
// and rebuilds the post pages when a post file changes during `npm run dev`.
function postsModule(): Plugin {
  const id = "virtual:posts";
  const resolved = "\0" + id;
  return {
    name: "posts",
    resolveId: (source) => (source === id ? resolved : undefined),
    load: (source) => (source === resolved ? `export default ${JSON.stringify(posts)};` : undefined),
    configureServer(server) {
      const dir = path.join(root, POSTS_DIR);
      const refresh = (file: string) => {
        if (!file.startsWith(dir)) return;
        posts = loadPosts(root);
        writePostPages(root, posts);
        const mod = server.moduleGraph.getModuleById(resolved);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pageHead(), postsModule()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rollupOptions: {
      input: {
        ...Object.fromEntries(site.pages.map((p) => [p.id, root + p.html])),
        ...Object.fromEntries(experimentPages.map((p) => [p.id, root + p.html])),
        ...Object.fromEntries(posts.map((p) => [`${p.section}-${p.slug}`, root + p.html])),
      },
    },
  },
});
