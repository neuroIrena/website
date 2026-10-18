import { StrictMode, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/newsreader";
import "./styles.css";

import { Layout } from "@/components/Layout";

const app = window as Window & { __root?: Root };

/** Renders a page inside the shared header and footer. */
export function mount(page: ReactNode) {
  // Reuse the root so the dev server's live reload doesn't create a second one.
  app.__root ??= createRoot(document.getElementById("root")!);
  app.__root.render(
    <StrictMode>
      <Layout>{page}</Layout>
    </StrictMode>,
  );
}
