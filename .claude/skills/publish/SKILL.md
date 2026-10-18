---
name: publish
description: Publish the website. Use only when Irena or Alex explicitly says something like "deploy it", "make it live", "publish it", "put it live" or "push". Pushes the saved local versions to GitHub main, which Netlify then builds and puts live. Never use it just because a change is finished.
---

# Publish the website

Until someone explicitly asks to deploy, every change stays in **local commits only**. This skill is the only time to push to the remote `main` branch. Netlify's free plan has a limited monthly build allowance, and every push triggers a build.

"Looks good", "thanks" or "save it" are **not** requests to deploy. If unsure, ask: "Do you want me to put this live now?"

## Steps

1. **Check there's something to publish.**
   `git status -sb` and `git log --oneline origin/main..HEAD`. If nothing is ahead of `origin/main` and the working tree is clean, say it's already live and stop.

2. **Save any unsaved work.** If there are uncommitted changes that belong to the request, run `npm run build`, then commit them with a short plain message. If there are uncommitted changes you didn't make or don't understand, ask before including them.

3. **Build.** Run `npm run build` (put `$HOME/.local/node/bin` on `PATH` first if `npm` isn't found). If it fails, **don't push**. Fix it, or explain the problem in plain words and stop.

4. **Push.** `git push origin main`. If the push is rejected because GitHub has newer changes, run `git pull --rebase origin main`, build again, then push. Never force-push.

5. **Check it went live.** Netlify builds in about a minute. The Netlify connector's project tools show the project `irenaarslanova` (site id `8135e70e-ff58-4049-837e-388645afc4e2`). Or load the changed pages on the live site with `curl` and look for the new content.

6. **Tell them.** For Irena, in plain words: "It's live now. You can see it at <link to the changed page>." List what went live if there were several saved versions. Don't mention commits, pushes or branches unless Alex is asking.

## Live addresses

- Netlify: https://irenaarslanova.netlify.app
- Own domain: https://irenaarslanova.com (once the domain has been switched to Netlify)
