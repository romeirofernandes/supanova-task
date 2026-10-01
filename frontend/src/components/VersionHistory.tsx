import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { m } from "motion/react";
import type { ProfileVersion } from "@/lib/api";
import type { Weights } from "@/lib/weights";
import { cn } from "cn";

interface Props {
  versions: ProfileVersion[];
  onSelect: (weights: Weights) => void;
}

export function VersionHistory({ versions, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const latest = versions[versions.length - 1];

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <m.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="flex">
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.5} />
        </m.span>
        {latest
          ? `v${latest.version} saved ${new Date(latest.saved_at).toLocaleDateString()} · ${versions.length} version${versions.length === 1 ? "" : "s"}`
          : "Unsaved defaults · no versions yet"}
      </button>
      {open && versions.length > 0 && (
        <div className="flex flex-col gap-1">
          {[...versions].reverse().map((v) => (
            <button
              key={v.version}
              type="button"
              onClick={() => onSelect({ ...v.weights })}
              title="Load into editor"
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border border-border px-3 py-1.5 text-left transition-colors duration-150 hover:bg-muted/60",
                v.version === latest?.version && "border-primary/30"
              )}
            >
              <span className="font-mono text-xs">v{v.version}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                R{v.weights.recency} N{v.weights.needsAttention} E{v.weights.evidence} P{v.weights.projectMatch}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
