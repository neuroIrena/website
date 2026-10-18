# irenaarslanova.com

Personal website of Dr. Irena Arslanova, cognitive neuroscientist and Leverhulme Early-Career Fellow at Royal Holloway, University of London.

## Who you are working with

**Irena** will usually be the person asking for changes. She is a scientist, not a web developer, and does not know Git or GitHub terms.

- Talk in plain language. Never ask her to run commands, and don't use words like commit, push, pull, branch, merge, repo or deploy without explaining them. Say "save a version and publish it" rather than "commit and push".
- Do all the technical steps yourself. Afterwards, tell her in a sentence or two what changed and when it will be live, with the page link.
- If a request is unclear, ask one simple question rather than guessing.
- Show her the change on the local preview first if it's anything more than a text or list edit.

**Alex**, Irena's partner, set up the site and knows how it works. When Alex is the one asking, technical language is fine.

## How the site works

- Static site: Vite + React + TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react icons. No database or server code (yet, see Supabase below).
- It's built as a **multi-page site**: each page has its own real `index.html`, so Google and link previews on LinkedIn and Bluesky see the right title and description. It is not a single-page app.
- Code lives on GitHub at `neuroIrena/website`, branch `main`.
- Hosting is on Netlify (project `irenaarslanova`, preview at https://irenaarslanova.netlify.app). Every push to `main` builds and publishes automatically within about a minute. Build settings and redirects from old WordPress addresses are in `netlify.toml`.
- Node.js is installed in the user's home folder, not system-wide. If `npm` isn't found, run `export PATH="$HOME/.local/node/bin:$PATH"` first.

Commands:

| Task | Command |
|---|---|
| Local preview | `npm run dev` (http://localhost:5173) |
| Check the build | `npm run build` |

## Where content lives

All text and lists are in JSON files. Most edits should change data only, never components.

| Irena asks to... | Edit this file |
|---|---|
| Change her bio, headline, job title, email, address, social links, portrait or CV link | `src/content/profile.json` |
| Add or edit a paper or research project | `src/content/research.json` |
| Add or edit a talk, radio interview or press article | `src/content/media.json` (`kind` is `Talk`, `Radio` or `Press`; `date` is `YYYY-MM`) |
| Change speaking topics, the speaking note, the collaboration note or the contact intro | `src/content/speaking.json` |
| Add a job or a degree | `src/content/cv.json` |
| Change a page's browser title, Google description or menu label | `src/content/site.json` |
| Update the CV PDF | Replace `public/cv.pdf` (keep the name) |

- **New items go at the top of their list**, newest first. The home page shows the first two research and media items.
- An empty `summary` or `link` (`""`) is simply not shown, so leave it empty rather than inventing text.
- Images go in `public/images/` with clear names like `research-topic-name.png` or `media-outlet-name.jpg`, referenced as `/images/...`. Ask Irena for the image or a link to one; don't make one up.
- `content-archive/wordpress-posts.md` has the full text of the old WordPress posts. It isn't shown on the site, but it's useful as a source when Irena asks for summaries.

## Writing style

- Plain and human. First person on the home page ("I study...").
- British spelling (behaviour, organise, centre).
- No em dashes. Use a comma, colon or full stop instead.
- Keep summaries to two or three sentences. Don't exaggerate her findings.

## Design rules

- **Don't change the layout, colours or fonts unless Irena asks for a design change.** The look was agreed with her: warm cream background, gold accent (from her original site), Bricolage Grotesque headings, Newsreader body text, her name set very large on the home page with a gold heartbeat trace underneath that draws once on load. The uneven gaps between beats are deliberate (her research is on how time stretches within each heartbeat).
- Colours are defined once as CSS variables at the top of `src/styles.css`, with a dark-mode set underneath. Use the Tailwind tokens (`bg-background`, `text-muted-foreground`, `text-accent`, `border`, etc.), never raw hex values in components.
- Every change must work on a phone (down to 375px wide) and in both light and dark mode, keep a visible keyboard focus, and respect reduced-motion settings.
- No gradients, no animations on every section, no all-caps labels.

## Components: use shadcn/ui

- **All UI elements must be shadcn/ui components.** Before building anything (buttons, cards, dialogs, tabs, forms, inputs, menus, accordions, etc.), use the shadcn version.
- shadcn components live in `src/components/ui/` and are styled to the site's tokens. Currently in use: `button`, `badge`.
- Add new ones with the shadcn CLI, pinned to a version at least 14 days old (4.21.1 at the time of writing): `npx shadcn@4.21.1 add card`. Then check `package.json`: the CLI may add dependencies at their latest version, so pin each to an exact version published at least 14 days earlier.
- Adjust a new component's styling to the site's tokens if needed, but keep its structure and API.
- Site-specific layouts are in `src/components/` and are built from shadcn parts plus plain HTML: `ItemCard` (research and media cards, uses `Badge`), `Lists` (grids and speaking-topic pills), `Layout` (header, footer, page and section titles), `HeartbeatTrace`. When changing these, prefer swapping in shadcn components over adding new custom markup.
- Icons come from `lucide-react`. Its current version has no brand logos (LinkedIn, X), so social links are text.

## Dependencies

- Pin exact versions (`.npmrc` has `save-exact=true`). Never install a release published in the last 14 days.
- Tailwind is held at **4.1.x** (4.0.0 has a multi-page build bug), and `@tailwindcss/vite` 4.1 only supports Vite up to 7, so Vite stays on 7.x until Tailwind is upgraded.

## Adding a new page

1. Add an entry to `pages` in `src/content/site.json` (`id`, `path`, `html`, `nav`, `title`, `description`). That one entry adds it to the menu, sets its `<head>` tags and registers it as a Vite build input.
2. Create the HTML file named in `html` (for example `talks/index.html`), copied from an existing page. Keep the `<!--head-->` placeholder and point the script to `/src/pages/<id>.tsx`.
3. Create `src/pages/<id>.tsx` that ends with `mount(<YourPage />)`. Use `PageTitle` and `SectionHeading` from `Layout`.
4. If it has its own content, add a JSON file in `src/content/` and export it from `src/lib/content.ts`.
5. Run `npm run build`, then check it on the local preview.

## Saving and publishing

1. Always run `npm run build` before saving a version. **Never push a broken build**: if it fails, fix it or tell Irena (or Alex) what's wrong.
2. Commit with a short, plain message describing the change for a human ("Add new paper on heartbeat and attention").
3. Push to `main`. Netlify publishes it automatically, about a minute later.
4. Tell Irena it's live and give her the page link.

Don't commit anything from outside this folder. The WordPress backup is deliberately kept in `../wordpress-backup/`.

## Supabase (future, not in use yet)

There is a Supabase account set aside for future use, possibly for collecting experiment data from study participants and possibly for blog posts. Nothing on the site uses it yet.

- Don't add Supabase or any database code unless Irena or Alex asks for it.
- Never commit keys or passwords. Only the public "anon"/publishable key may go into the front end, as a `VITE_` environment variable set in Netlify. Service-role keys must never be in this repository.
- Any table that the website can reach must have row-level security switched on.
- Data from study participants is personal research data. Before building anything that collects it, check with Irena about ethics approval, consent wording and data protection (UK GDPR), and collect as little as possible.
- If blog posts are added, they're likely better as Markdown files in the repository first, and only moved to Supabase if Irena needs to write them outside Claude Code. Discuss it before choosing.

## Known gaps

From the move off WordPress (October 2026):

- **The domain isn't connected yet.** irenaarslanova.com still points to WordPress.com. Steps: add `irenaarslanova.com` and `www.irenaarslanova.com` as custom domains in Netlify, then add the DNS records it gives in WordPress.com (Upgrades, Domains, irenaarslanova.com, DNS records). Keep the domain registration and its auto-renew. Once HTTPS is active and every page has been checked on the real domain, turn off auto-renew on the **WordPress.com Personal** plan (renews 29 October 2026). Don't cancel the domain.
- "Seeing through each other's hearts" in `research.json` has no summary. Ask Irena for one (the abstract is in `content-archive/wordpress-posts.md`).
- "Perceived time expands and contracts within each heartbeat" reuses the TEDx blurb as its summary. Ask Irena whether she wants her own.
- The logo is a PNG saved from the old site (`public/images/logo.png`). Irena has an SVG version to send. Save it as `public/images/logo.svg` and update `logo` in `profile.json`.
- Confirm `public/cv.pdf` (August 2026) is her latest CV. It includes her mobile number.
- Not on the old site but in her CV, so possible additions: Psyche article, two podcasts (Brain Space Time, The Encourager), Pint of Science, a publications list.
- The 404 page is Netlify's plain default.
- Images in `public/images/` total about 5 MB and could be resized and compressed. `portrait-casual.jpg` (1.6 MB) isn't used anywhere.
