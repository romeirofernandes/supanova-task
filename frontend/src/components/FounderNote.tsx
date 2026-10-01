import { AnimatePresence, m } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  sentence: string | null;
  loading: boolean;
}

export function FounderNote({ sentence, loading }: Props) {
  return (
    <Card className="border-primary/30 bg-primary/[0.06]">
      <CardContent className="flex items-start gap-2.5 pt-3">
        <HugeiconsIcon icon={InformationCircleIcon} size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">What this change does</p>
          <AnimatePresence mode="wait" initial={false}>
            {loading || !sentence ? (
              <m.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Skeleton className="mt-1.5 h-5 w-4/5" />
              </m.div>
            ) : (
              <m.p
                key={sentence}
                initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="t-text-swap mt-0.5 text-sm leading-relaxed"
              >
                {sentence}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
