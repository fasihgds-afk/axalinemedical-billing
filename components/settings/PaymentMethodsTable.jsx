"use client";

import { useState } from "react";
import { Pencil, Wallet } from "lucide-react";
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
import { PaymentMethodForm } from "@/components/settings/PaymentMethodForm";
import { DeletePaymentMethodDialog } from "@/components/settings/DeletePaymentMethodDialog";

export function PaymentMethodsTable({ methods = [] }) {
  const [editingMethod, setEditingMethod] = useState(null);

  return (
    <>
      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>All payment methods</GradientCardTitle>
          <GradientCardDescription>
            {methods.length} method{methods.length === 1 ? "" : "s"} configured
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          {methods.length === 0 ? (
            <div className={gradientEmptyStateClass}>
              <Wallet className="mb-3 h-9 w-9 text-primary/40" />
              <p className="text-sm font-medium">No payment methods</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first payment method above.
              </p>
            </div>
          ) : (
            <div className={gradientTableShellClass}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method._id}>
                      <TableCell className="font-medium">
                        {method.name}
                        {method.isDefault ? (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Default
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {method.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={method.active ? "default" : "secondary"}>
                          {method.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMethod(method)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {!method.isDefault ? (
                            <DeletePaymentMethodDialog
                              methodId={method._id}
                              methodName={method.name}
                            />
                          ) : null}
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

      <Dialog open={Boolean(editingMethod)} onOpenChange={(open) => !open && setEditingMethod(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit payment method</DialogTitle>
          </DialogHeader>
          {editingMethod ? (
            <PaymentMethodForm
              mode="edit"
              method={editingMethod}
              onSuccess={() => setEditingMethod(null)}
              onCancel={() => setEditingMethod(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
