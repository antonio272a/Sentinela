"use client";

import { useEffect, useId, useState } from "react";

type ScoreSliderProps = {
  name: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  minLabel: string;
  maxLabel: string;
};

function clampScore(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

export function ScoreSlider({
  name,
  defaultValue,
  min = 0,
  max = 10,
  step = 1,
  minLabel,
  maxLabel,
}: ScoreSliderProps) {
  const inputId = useId();
  const [value, setValue] = useState(() => clampScore(defaultValue, min, max));

  useEffect(() => {
    setValue(clampScore(defaultValue, min, max));
  }, [defaultValue, min, max]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>Valor selecionado</span>
        <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200">
          {value}
        </span>
      </div>
      <input
        id={inputId}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = clampScore(event.target.valueAsNumber, min, max);
          setValue(nextValue);
        }}
        className="w-full accent-amber-400"
        required
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
