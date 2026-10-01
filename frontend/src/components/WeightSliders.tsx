import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineSlider } from "@/components/motion/range-slider-inline";
import { WEIGHT_KEYS, isFullTotal, normalizeWeights, sumWeights, type WeightKey, type Weights } from "@/lib/weights";
import { cn } from "@/lib/utils";

const LABELS: Record<WeightKey, string> = {
  recency: "Recency",
  needsAttention: "Needs attention",
  evidence: "Evidence",
  projectMatch: "Project match",
};

interface Props {
  weights: Weights;
  onChange: (w: Weights) => void;
}

export function WeightSliders({ weights, onChange }: Props) {
  const total = sumWeights(weights);
  const valid = isFullTotal(weights);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calibration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {WEIGHT_KEYS.map((key) => (
          <InlineSlider
            key={key}
            label={LABELS[key]}
            aria-label={LABELS[key]}
            value={weights[key]}
            min={0}
            max={100}
            step={1}
            format={(v) => `${Math.round(v)}%`}
            onValueChange={(v) => onChange({ ...weights, [key]: v })}
          />
        ))}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <span
            className={cn(
              "font-mono text-xs tabular-nums",
              valid ? "text-muted-foreground" : "text-destructive",
            )}
          >
            Total {Math.round(total)}%{valid ? "" : " · must sum to 100 to save"}
          </span>
          {!valid && (
            <Button variant="outline" size="xs" onClick={() => onChange(normalizeWeights(weights))}>
              Balance to 100%
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
