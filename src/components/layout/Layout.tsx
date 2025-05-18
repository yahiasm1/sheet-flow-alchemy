
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {user && (
        <header className="bg-white border-b shadow-sm">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="font-bold text-xl">
                Worksheet Manager
              </a>
              <nav className="hidden md:flex ml-8">
                <a href="/" className="mx-2 px-3 py-2 rounded hover:bg-gray-100">
                  Dashboard
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="bg-gray-50 text-gray-500 text-sm py-6">
        <div className="container text-center">
          &copy; {new Date().getFullYear()} Worksheet Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
