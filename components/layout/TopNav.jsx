"use client";

import { Menu, ChevronDown, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/Sidebar";
import { APP_NAME } from "@/config/constants";
import { getPageTitle } from "@/lib/pageTitles";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TopNav({ user }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border/50 bg-background">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-8">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 border-0 bg-sidebar-gradient p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{APP_NAME}</SheetTitle>
            </SheetHeader>
            <SidebarContent user={user} />
          </SheetContent>
        </Sheet>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium text-foreground md:inline">
                  {user?.name}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
