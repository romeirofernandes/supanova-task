import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";

export interface SliderOptions {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  formatValueText?: (value: number) => string;
}

export function snapSliderValue(value: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  if (!(step > 0)) return clamped;
  const snapped = Math.round((clamped - min) / step) * step + min;
  const decimals = step.toFixed(6).replace(/0+$/, "").split(".")[1]?.length ?? 0;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(decimals))));
}

export function useSlider(options: SliderOptions) {
  const { value, defaultValue, disabled, onValueChange, formatValueText } = options;
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  const step = options.step && options.step > 0 ? options.step : 1;
  const [internal, setInternal] = useState(() => snapSliderValue(defaultValue ?? min, min, max, step));
  const controlled = value !== undefined;
  const current = snapSliderValue(controlled ? value : internal, min, max, step);
  const trackRef = useRef<HTMLDivElement>(null);

  const commit = useCallback(
    (next: number) => {
      const snapped = snapSliderValue(next, min, max, step);
      if (!controlled) setInternal(snapped);
      onValueChange?.(snapped);
    },
    [controlled, min, max, step, onValueChange],
  );

  const trackProps = { ref: trackRef } as { ref: RefObject<HTMLDivElement | null> };
  const sliderProps = {
    role: "slider",
    tabIndex: disabled ? -1 : 0,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": current,
    "aria-valuetext": formatValueText?.(current) ?? String(current),
    "aria-label": options["aria-label"],
    "aria-labelledby": options["aria-labelledby"],
    "aria-orientation": "horizontal" as const,
    "aria-disabled": disabled || undefined,
  };

  return { current, min, max, commit, trackProps, sliderProps };
}
