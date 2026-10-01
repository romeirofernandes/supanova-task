import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { m } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Mover } from "@/lib/api";
import { cn } from "cn";

export function MoversList({ movers }: { movers: Mover[] }) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Biggest movers</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {movers.map((mv, i) => {
          const up = mv.delta > 0;
          return (
            <m.div
              key={mv.key}
              initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-3 px-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{mv.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  #{mv.old_rank} → #{mv.new_rank}
                </p>
              </div>
              <Badge className={cn("shrink-0", up ? "text-primary" : "text-destructive")}>
                <HugeiconsIcon icon={up ? ArrowUp01Icon : ArrowDown01Icon} size={14} strokeWidth={2} />
                {up ? "+" : ""}
                {mv.delta}
              </Badge>
            </m.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
