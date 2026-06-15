import { cn } from "@/lib/utils";

export function FormSelect({
  id,
  name,
  label,
  required = false,
  defaultValue = "",
  placeholder = "Select...",
  options = [],
  disabled = false,
  className,
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? " *" : ""}
        </label>
      ) : null}
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        disabled={disabled}
        className={cn(
          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          className
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
