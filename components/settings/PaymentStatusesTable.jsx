"use client";

import { useState } from "react";
import { Pencil, Tags } from "lucide-react";
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
import { PaymentStatusForm } from "@/components/settings/PaymentStatusForm";
import { DeletePaymentStatusDialog } from "@/components/settings/DeletePaymentStatusDialog";

export function PaymentStatusesTable({ statuses = [] }) {
  const [editingStatus, setEditingStatus] = useState(null);

  return (
    <>
      <GradientCard>
        <GradientCardHeader>
          <GradientCardTitle>All payment statuses</GradientCardTitle>
          <GradientCardDescription>
            {statuses.length} status{statuses.length === 1 ? "" : "es"} configured
          </GradientCardDescription>
        </GradientCardHeader>
        <GradientCardContent>
          {statuses.length === 0 ? (
            <div className={gradientEmptyStateClass}>
              <Tags className="mb-3 h-9 w-9 text-primary/40" />
              <p className="text-sm font-medium">No payment statuses</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first status above.
              </p>
            </div>
          ) : (
            <div className={gradientTableShellClass}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statuses.map((status) => (
                    <TableRow key={status._id}>
                      <TableCell className="text-muted-foreground">
                        {status.sortOrder}
                      </TableCell>
                      <TableCell className="font-medium">
                        {status.name}
                        {status.isDefault ? (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Default
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: status.color,
                            color: status.color,
                          }}
                        >
                          {status.color}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.active ? "default" : "secondary"}>
                          {status.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingStatus(status)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          {!status.isDefault ? (
                            <DeletePaymentStatusDialog
                              statusId={status._id}
                              statusName={status.name}
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

      <Dialog
        open={Boolean(editingStatus)}
        onOpenChange={(open) => !open && setEditingStatus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit payment status</DialogTitle>
          </DialogHeader>
          {editingStatus ? (
            <PaymentStatusForm
              mode="edit"
              status={editingStatus}
              onSuccess={() => setEditingStatus(null)}
              onCancel={() => setEditingStatus(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
