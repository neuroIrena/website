import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import site from "./src/content/site.json";

const root = fileURLToPath(new URL(".", import.meta.url));

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Fills the <!--head--> placeholder in each page's HTML with its title,
// description, canonical URL and social preview tags from site.json.
function pageHead(): Plugin {
  return {
    name: "page-head",
    transformIndexHtml(html, ctx) {
      const file = ctx.path.replace(/^\//, "");
      const page = site.pages.find((p) => p.html === file);
      if (!page) throw new Error(`No entry in src/content/site.json for ${file}`);
      const url = site.url + page.path;
      const image = site.url + site.ogImage;
      const title = escape(page.title);
      const desc = escape(page.description);
      const head = [
        `<title>${title}</title>`,
        `<meta name="description" content="${desc}" />`,
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${escape(site.name)}" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${desc}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${image}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${desc}" />`,
        `<meta name="twitter:image" content="${image}" />`,
      ].join("\n    ");
      return html.replace("<!--head-->", head);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), pageHead()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(site.pages.map((p) => [p.id, root + p.html])),
    },
  },
});
