"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BRAND_COLORS } from "@/config/constants";

const PRESET_COLORS = [
  { label: "Axaline Blue", value: BRAND_COLORS.blue },
  { label: "Axaline Red", value: BRAND_COLORS.red },
  { label: "Gray", value: BRAND_COLORS.gray },
  { label: "Amber", value: "#F59E0B" },
  { label: "Indigo", value: "#6366F1" },
];

export function ColorPicker({
  id = "color",
  name = "color",
  defaultValue = BRAND_COLORS.blue,
  disabled = false,
}) {
  const [color, setColor] = useState(defaultValue);

  function handleHexChange(value) {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setColor(value);
    }
  }

  function handleColorInputChange(value) {
    setColor(value.toUpperCase());
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>Badge color *</Label>

      <input type="hidden" name={name} value={color} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          id={`${id}-picker`}
          value={color.length === 7 ? color : BRAND_COLORS.blue}
          onChange={(event) => handleColorInputChange(event.target.value)}
          disabled={disabled}
          className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
        />
        <Input
          id={id}
          value={color}
          onChange={(event) => handleHexChange(event.target.value)}
          placeholder="#1E67B5"
          maxLength={7}
          disabled={disabled}
          className="max-w-[140px] font-mono text-sm uppercase"
        />
        <div
          className="h-8 min-w-[80px] rounded-md border px-3 text-xs font-medium leading-8 text-white shadow-sm"
          style={{ backgroundColor: color.length === 7 ? color : BRAND_COLORS.gray }}
        >
          Preview
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            disabled={disabled}
            onClick={() => setColor(preset.value)}
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <span
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: preset.value }}
            />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
