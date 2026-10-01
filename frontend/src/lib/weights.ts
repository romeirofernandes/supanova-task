export type WeightKey = "recency" | "needsAttention" | "evidence" | "projectMatch";

export type Weights = Record<WeightKey, number>;

export const WEIGHT_KEYS: WeightKey[] = ["recency", "needsAttention", "evidence", "projectMatch"];

export const WEIGHT_META: Record<WeightKey, { label: string; hint: string }> = {
  recency: { label: "Recency", hint: "Newer signals rank higher" },
  needsAttention: { label: "Needs attention", hint: "Unresolved work ranks higher" },
  evidence: { label: "Evidence", hint: "More source material ranks higher" },
  projectMatch: { label: "Project match", hint: "Selected project ranks higher" },
};

export const DEFAULT_WEIGHTS: Weights = {
  recency: 40,
  needsAttention: 35,
  evidence: 15,
  projectMatch: 10,
};

export function sumWeights(weights: Weights): number {
  return WEIGHT_KEYS.reduce((s, k) => s + weights[k], 0);
}

export function isFullTotal(weights: Weights): boolean {
  return Math.abs(sumWeights(weights) - 100) < 0.01;
}

export function normalizeWeights(weights: Weights): Weights {
  const total = sumWeights(weights);
  const next: Weights = { ...weights };
  if (total <= 0) {
    const each = Math.round((100 / WEIGHT_KEYS.length) * 10) / 10;
    WEIGHT_KEYS.forEach((k) => {
      next[k] = each;
    });
  } else {
    WEIGHT_KEYS.forEach((k) => {
      next[k] = Math.round(((weights[k] / total) * 100) * 10) / 10;
    });
  }
  const last = WEIGHT_KEYS[WEIGHT_KEYS.length - 1];
  const drift = 100 - sumWeights(next);
  next[last] = Math.round((next[last] + drift) * 10) / 10;
  return next;
}
