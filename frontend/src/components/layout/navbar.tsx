"use client";

import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import {
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { generateAvatar } from "@/lib/utils";
import { useState } from "react";

export function Navbar() {
  const { user, logout, toggleSidebar } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
        <ChevronDown className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <NotificationsDropdown />

      <div className="relative">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {user ? generateAvatar(`${user.firstName} ${user.lastName}`) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left lg:block">
            <p className="text-sm font-medium leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </Button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                <User className="h-4 w-4" />
                Profile
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <hr className="my-1 border-border" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
