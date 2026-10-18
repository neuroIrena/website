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
- Hosting is on Netlify's free plan (project `irenaarslanova`, preview at https://irenaarslanova.netlify.app). Every push to `main` builds and publishes automatically within about a minute, and each build uses some of the free plan's monthly build allowance. Build settings and redirects from old WordPress addresses are in `netlify.toml`.
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
| Add or edit a paper or research project | `src/content/research.json` (the card), plus its post in `src/content/posts/` |
| Add or edit a talk, radio interview or press article | `src/content/media.json` (the card; `kind` is `Talk`, `Radio` or `Press`; `date` is `YYYY-MM`), plus its post in `src/content/posts/` |
| Change the full text of a post | `src/content/posts/<name>.md` |
| Change speaking topics, the speaking note, the collaboration note or the contact intro | `src/content/speaking.json` |
| Add a job or a degree | `src/content/cv.json` |
| Change a page's browser title, Google description or menu label | `src/content/site.json` |
| Update the CV PDF | Replace `public/cv.pdf` (keep the name) |

- **New items go at the top of their list**, newest first. The home page shows the first two research and media items.
- An empty `summary` or `link` (`""`) is simply not shown, so leave it empty rather than inventing text.
- Images go in `public/images/` with clear names like `research-topic-name.png` or `media-outlet-name.jpg`, referenced as `/images/...`. Ask Irena for the image or a link to one; don't make one up.
- `content-archive/wordpress-posts.md` is the raw text of the old WordPress posts as saved during the move. The posts now live in `src/content/posts/`; the archive is kept only as a record.

## Posts

Every research and media card opens its own post page, like the old WordPress posts did. A post is one Markdown text file in `src/content/posts/`. The file name is the post's address: `tedx-berlin.md` with `section: media` becomes `/media/tedx-berlin/`.

```markdown
---
title: TEDx Berlin: Does your heartbeat shape your sense of time?
section: media
image: /images/media-tedx-berlin.png
source: https://www.ted.com/talks/...
sourceLabel: Watch the talk on TED
credit: By ..., in ... (2023)
description: One sentence for Google and link previews (optional).
---

The text, in Markdown. Paragraphs are separated by a blank line.
Quotes from articles go in a > blockquote. Images: ![What the image shows](/images/name.png)
```

- `title` and `section` (`research` or `media`) are required. `image` is the large picture at the top. `source` and `sourceLabel` make the button to the original (paper, interview, article). `credit` is the author line under the title. If `description` is missing, the first 155 characters of the text are used.
- To link a card to its post, set `"post": "<file name without .md>"` on the item in `research.json` or `media.json`. Cards with a `post` open the post page; cards without one link straight to their outside `link`.
- **Adding a new paper or media item = a new card at the top of the JSON list + a new `.md` file.** Ask Irena for the text (abstract, blurb) and the link; never write a fake abstract.
- Keep quoted or published text (paper abstracts, press quotes) exactly as published, including its spelling and punctuation. The writing-style rules below apply to Irena's own words.
- The page for each post (`research/<name>/index.html`, `media/<name>/index.html`) is generated automatically by `src/lib/posts-build.ts` when the site builds or `npm run dev` starts. Those generated folders are in `.gitignore`. Don't create or edit them by hand.
- While `npm run dev` is running, editing a post updates the page. A brand-new post file is picked up straight away too; if it isn't, restart `npm run dev`.

## Experiments

Online studies live under `/experiments/`. The list page shows a card for each one; each study has its own page at `/experiments/<slug>/` and is marked `noindex` so it stays out of Google. The site header stays visible during a study so participants can always get back to the main site.

- `src/content/experiments.json` is the list of cards. `vite.config.ts` turns each entry into a page (`experiments/<slug>/index.html`), so a new study needs: an entry here, that HTML file (copy an existing one, point the script at `src/pages/experiment-<slug>.tsx`), that page file, and its components.
- Studies run as a **scripted chat**: a "study assistant" sends messages one at a time with a typing pause and the participant answers with buttons, a rating row or a small form. It is not a language model and must not be described as one; every participant gets exactly the same wording. The engine is `src/experiments/chat/useConversation.ts` (`say` and `ask`) and `ChatView.tsx`; a study is one async function that calls them (see `src/experiments/FeedTimeExperiment.tsx`). Pages that run a study mount with `{ footer: false }`.
- The chat UI uses shadcn **AI Elements** (`src/components/ai-elements/`: `conversation`, `message`, `question`). `conversation` and `message` are trimmed copies: the download, Markdown streaming (streamdown), branch and action parts were left out so the `ai`, `streamdown` and mermaid packages aren't needed. Add them back from the registry (`npx shadcn@<pinned> add @ai-elements/<name>`) if a study needs them.
- The first study, "Scrolling through time" (`feed-time`), is a retrospective time-estimation task: an Instagram-style feed autoscrolls for a fixed 45 seconds, then participants estimate how long it lasted. Two conditions, assigned at random: `quality` (told they'll rate the content) and `decision` (told to decide between Greece and Italy). Duration is the control and must stay the same for everyone. The feed runs inside the page, not fullscreen.
- All its text (welcome, information sheet, consent statements, instructions, questions, debrief) is in `src/content/experiments/feed-time.json`; feed posts are in `feed-posts.json`. Placeholders in square brackets in the consent text (ethics reference, ethics contact, DPO contact, retention period) must be filled by Irena before the study goes live.
- Feed images in `public/images/feed/` are flat-colour placeholders. Replace them with licensed stock or AI-generated images of the same file names.
- For testing, add `?condition=decision&seconds=10` to the study address to force a condition and shorten the feed. Such runs are recorded with `testMode: true`.
- Nothing is saved yet. `src/experiments/save.ts` only logs in the local preview; Supabase goes there later (insert-only table, row-level security, public key only, no IP or personal data).
- Participant data is research data: don't add new questions or stored fields without checking with Irena that the ethics approval and consent sheet cover them.

## Writing style

- Plain and human. First person on the home page ("I study...").
- British spelling (behaviour, organise, centre).
- No em dashes. Use a comma, colon or full stop instead.
- Keep summaries to two or three sentences. Don't exaggerate her findings.

## Design rules

- **Don't change the layout, colours or fonts unless Irena asks for a design change.** The look was agreed with her: warm cream background, gold accent (from her original site), Bricolage Grotesque headings, Newsreader body text, her name set very large on the home page with a gold heartbeat trace underneath that draws once on load. The uneven gaps between beats are deliberate (her research is on how time stretches within each heartbeat).
- Colours are defined once as CSS variables at the top of `src/styles.css`, with a dark-mode set underneath. They use shadcn/ui's token names: **`primary` is the gold** (buttons, links, icons), `accent` is shadcn's subtle cream hover background (not the gold), and `trace` is the heartbeat line. Use the Tailwind tokens (`bg-background`, `text-muted-foreground`, `text-primary`, `border`, etc.), never raw hex values in components.
- Every change must work on a phone (down to 375px wide) and in both light and dark mode, keep a visible keyboard focus, and respect reduced-motion settings.
- No gradients, no animations on every section, no all-caps labels.

## Components: use shadcn/ui

- **All UI elements must be shadcn/ui components.** Before building anything (buttons, cards, dialogs, tabs, forms, inputs, menus, accordions, etc.), use the shadcn version.
- shadcn components live in `src/components/ui/`: `button`, `badge`, `card`, `separator`, `input`, `label`, `checkbox`, `radio-group`, `textarea`. They are the official shadcn source, with only the button's shape and fonts adjusted (rounded, heading font, larger default size).
- Site-specific layouts in `src/components/` are built from them: `ItemCard` (research and media cards: `Card` + `Badge`), `Lists` (card grids and speaking-topic pills as `Badge`), `Layout` (header, footer, page titles, section headings with `Separator`), `HeartbeatTrace` (the SVG line under her name). The CV timeline uses `Separator`, and the home-page illustration sits in a `Card`.
- Add new components with the shadcn CLI pinned to a version at least 14 days old (4.21.1 at the time of writing). **Known issue:** in this project, `shadcn add` writes `import { cn } from "cn"`, which breaks the build. Either fix that line to `import { cn } from "@/lib/utils"` after adding, or view the source with `npx shadcn@4.21.1 add <name> --view` and write the file by hand. Primitives come from the single `radix-ui` package (pinned). Check `package.json` afterwards and pin anything the CLI added to an exact version published at least 14 days earlier.
- Keep a new component's structure and API. Adjust styling only through the site's tokens.
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

Work locally first. Netlify's free plan has a limited monthly build allowance, and every push to GitHub triggers a build, so **save versions locally and only publish when asked**.

1. Make the change and check it on the local preview (`npm run dev`).
2. Run `npm run build`. **Never commit or push a broken build**: if it fails, fix it or explain what's wrong.
3. Save a version locally: commit with a short, plain message describing the change for a human ("Add new paper on heartbeat and attention"). Several small commits are fine.
4. **Don't push after every change.** Push to `main` only when Irena or Alex explicitly asks to deploy: "deploy it", "make it live", "publish it", "put it live", "push". Then follow the `publish` skill (`.claude/skills/publish/SKILL.md`). One push publishes all the saved versions together. "Looks good" on its own is not a request to deploy.
5. After pushing, Netlify publishes automatically about a minute later. Tell Irena it's live and give her the page link.

When talking to Irena: "I've saved this version on your computer. It isn't on the public site yet. Say 'publish' when you're happy and I'll put everything live."

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
- The short descriptions (for Google and link previews) in the three research posts were written during the move. Ask Irena to check them.
- A separate Blog page for writing not tied to a paper or media item was discussed but not built. It could reuse the posts setup with a new `section: blog`.
- Images in `public/images/` total about 5 MB and could be resized and compressed. `portrait-casual.jpg` (1.6 MB) isn't used anywhere.
