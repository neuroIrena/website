import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-display text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
