import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/newsreader";
import "./styles.css";

import { Layout } from "@/components/Layout";

/** Renders a page inside the shared header and footer. */
export function mount(page: ReactNode) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Layout>{page}</Layout>
    </StrictMode>,
  );
}
