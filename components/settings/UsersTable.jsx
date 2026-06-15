"use client";

import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { UserRoleSelect } from "@/components/settings/UserRoleSelect";
import { DeactivateUserDialog } from "@/components/settings/DeactivateUserDialog";
import { formatDate } from "@/lib/formatDate";

export function UsersTable({ users = [], currentUserId }) {
  return (
    <GradientCard>
      <GradientCardHeader>
        <GradientCardTitle>Team members</GradientCardTitle>
        <GradientCardDescription>
          {users.length} user{users.length === 1 ? "" : "s"} — manage roles and access
        </GradientCardDescription>
      </GradientCardHeader>
      <GradientCardContent>
        {users.length === 0 ? (
          <div className={gradientEmptyStateClass}>
            <Users className="mb-3 h-9 w-9 text-primary/40" />
            <p className="text-sm font-medium">No users yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a user above to grant access to the system.
            </p>
          </div>
        ) : (
          <div className={gradientTableShellClass}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user._id === currentUserId;
                  const canManage = user.active && !isSelf;

                  return (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.name}
                        {isSelf ? (
                          <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.active ? (
                          <UserRoleSelect
                            userId={user._id}
                            currentRole={user.role}
                            disabled={!canManage}
                          />
                        ) : (
                          <Badge variant="outline">{user.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.active ? (
                          <Badge className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Deactivated
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.active ? (
                          <DeactivateUserDialog
                            userId={user._id}
                            userName={user.name}
                            disabled={!canManage}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </GradientCardContent>
    </GradientCard>
  );
}
