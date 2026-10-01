import { useMemo, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";
import type { RankedSignal } from "@/lib/api";

const PAGE_SIZE = 11;

export function RankingTable({ signals, projectId }: { signals: RankedSignal[]; projectId: string }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(signals.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const current = useMemo(
    () => signals.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [signals, safePage]
  );

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            Ranking{" "}
            <span className="font-mono text-xs font-normal text-muted-foreground">{signals.length} signals</span>
          </CardTitle>
          <div className="t-tabs flex items-center gap-0.5 rounded-lg bg-muted p-1" role="tablist" aria-label="Ranking pages">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === safePage}
                onClick={() => setPage(i)}
                className={cn(
                  "h-7 min-w-7 rounded-md px-1.5 font-mono text-xs tabular-nums transition-all duration-150 active:scale-[0.96]",
                  i === safePage
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={safePage}
            initial={{ opacity: 0, x: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {current.map((s) => (
              <div
                key={s.key}
                className={cn(
                  "flex min-h-0 flex-1 items-center gap-3 border-b border-border/60 px-2 py-1 transition-colors duration-150 last:border-0 hover:bg-muted/60",
                  s.projects.includes(projectId) && "bg-primary/[0.07] hover:bg-primary/[0.12]",
                )}
              >
                <span className="w-7 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                  {s.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{s.title}</p>
                  <p className="mt-0.5 font-mono text-xs tabular-nums">
                    <span className="text-muted-foreground">{s.date}</span>
                    {s.time ? <span className="text-muted-foreground/70"> · {s.time}</span> : null}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-foreground">
                  {s.score.toFixed(3)}
                </span>
              </div>
            ))}
          </m.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
