import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { profile, site } from "@/lib/content";
import { cn } from "@/lib/utils";

function isCurrent(path: string) {
  const here = window.location.pathname.replace(/index\.html$/, "");
  return path === "/" ? here === "/" : here.startsWith(path);
}

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 pt-6 pb-4 sm:px-8 sm:pt-8">
      <a href="/" className="flex items-center gap-3 self-center font-display text-lg font-semibold no-underline">
        <img src={profile.logo} alt="" width={1527} height={980} className="h-10 w-auto sm:h-12" />
        {profile.name}
      </a>
      <nav aria-label="Main">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 font-display text-[0.95rem]">
          {site.pages.map((page) => {
            const current = isCurrent(page.path);
            return (
              <li key={page.id}>
                <a
                  href={page.path}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "no-underline decoration-primary decoration-2 hover:underline",
                    current ? "text-foreground underline" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {page.nav}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  const links = [
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "Google Scholar", href: profile.links.googleScholar },
    { label: "Bluesky", href: profile.links.bluesky },
    { label: "X", href: profile.links.x },
    { label: "LinkedIn", href: profile.links.linkedin },
  ];
  return (
    <footer className="mt-24">
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="text-base text-muted-foreground">
          <p className="font-display font-semibold text-foreground">
            {profile.title} {profile.name}
          </p>
          <p>
            {profile.role}, {profile.department}
          </p>
          <p>{profile.institution}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 font-display text-[0.95rem]">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="decoration-primary decoration-2 hover:text-primary">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:font-display"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PageTitle({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="max-w-3xl pt-10 pb-12 sm:pt-16">
      <h1 className="text-5xl font-semibold sm:text-6xl">{title}</h1>
      {intro && <div className="mt-5 text-lg text-muted-foreground">{intro}</div>}
    </div>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-8">
      <Separator className="mb-6" />
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-3xl font-semibold">{title}</h2>
        {action}
      </div>
    </div>
  );
}
