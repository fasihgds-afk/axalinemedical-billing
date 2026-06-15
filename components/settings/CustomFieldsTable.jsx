"use client";

import { useState } from "react";
import { Pencil, FormInput } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GradientCard,
  GradientCardContent,
  GradientCardDescription,
  GradientCardHeader,
  GradientCardTitle,
  gradientEmptyStateClass,
  gradientTableShellClass,
} from "@/components/layout/GradientCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomFieldForm } from "@/components/settings/CustomFieldForm";
import { DeleteCustomFieldDialog } from "@/components/settings/DeleteCustomFieldDialog";

export function CustomFieldsTable({ fields = [] }) {
  const [editingField, setEditingField] = useState(null);

  return (
    <>
      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>All custom fields</GradientCardTitle>
          <GradientCardDescription>
            {fields.length} field{fields.length === 1 ? "" : "s"} — active fields
            appear on payment forms
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          {fields.length === 0 ? (
            <div className={gradientEmptyStateClass}>
              <FormInput className="mb-3 h-9 w-9 text-primary/40" />
              <p className="text-sm font-medium">No custom fields</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a field above to extend payment records.
              </p>
            </div>
          ) : (
            <div className={gradientTableShellClass}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field._id}>
                      <TableCell className="font-medium">{field.label}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {field.key}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{field.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {field.required ? (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          ) : null}
                          {field.showInTable ? (
                            <Badge variant="secondary" className="text-xs">
                              In table
                            </Badge>
                          ) : null}
                          {field.active ? (
                            <Badge className="text-xs">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingField(field)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <DeleteCustomFieldDialog
                            fieldId={field._id}
                            fieldLabel={field.label}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </GradientCardContent>
      </GradientCard>

      <Dialog
        open={Boolean(editingField)}
        onOpenChange={(open) => !open && setEditingField(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit custom field</DialogTitle>
          </DialogHeader>
          {editingField ? (
            <CustomFieldForm
              mode="edit"
              field={editingField}
              onSuccess={() => setEditingField(null)}
              onCancel={() => setEditingField(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
