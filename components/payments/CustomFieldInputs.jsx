import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/payments/FormSelect";

export function CustomFieldInputs({ fields = [], values = {} }) {
  if (!fields.length) return null;

  return (
    <div className="space-y-4 border-t pt-4">
      <p className="text-sm font-medium text-foreground">Custom fields</p>
      {fields.map((field) => {
        const fieldName = `custom_${field.key}`;
        const defaultValue = values[field.key] ?? "";

        if (field.type === "Textarea") {
          return (
            <div key={field._id} className="space-y-2">
              <Label htmlFor={fieldName}>
                {field.label}
                {field.required ? " *" : ""}
              </Label>
              <Textarea
                id={fieldName}
                name={fieldName}
                defaultValue={defaultValue}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
              />
            </div>
          );
        }

        if (field.type === "Dropdown") {
          return (
            <FormSelect
              key={field._id}
              id={fieldName}
              name={fieldName}
              label={`${field.label}${field.required ? " *" : ""}`}
              required={field.required}
              defaultValue={defaultValue}
              placeholder={field.placeholder || "Select..."}
              options={(field.options || []).map((option) => ({
                value: option,
                label: option,
              }))}
            />
          );
        }

        if (field.type === "Boolean") {
          return (
            <div key={field._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={fieldName}
                name={fieldName}
                value="true"
                defaultChecked={Boolean(defaultValue)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor={fieldName}>{field.label}</Label>
            </div>
          );
        }

        const inputType =
          field.type === "Number"
            ? "number"
            : field.type === "Date"
              ? "date"
              : "text";

        return (
          <div key={field._id} className="space-y-2">
            <Label htmlFor={fieldName}>
              {field.label}
              {field.required ? " *" : ""}
            </Label>
            <Input
              id={fieldName}
              name={fieldName}
              type={inputType}
              defaultValue={
                field.type === "Date" && defaultValue
                  ? defaultValue.slice(0, 10)
                  : defaultValue
              }
              placeholder={field.placeholder}
              required={field.required}
              step={field.type === "Number" ? "0.01" : undefined}
            />
            {field.type === "File" ? (
              <p className="text-xs text-muted-foreground">
                File custom fields use text URL in demo mode. Full upload support in a future update.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
