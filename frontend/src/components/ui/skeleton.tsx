import { cn } from "cn";
import type { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("t-skel is-pulsing animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
