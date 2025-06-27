"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { getAppUrl, getAuthUrl } from "@/lib/app-redirect";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#18181B]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold">Kilometers</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-[#FAFAFA]/80 hover:text-[#0EA5E9] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[#FAFAFA]/80 hover:text-[#0EA5E9] transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/docs"
              className="text-[#FAFAFA]/80 hover:text-[#0EA5E9] transition-colors"
            >
              Docs
            </Link>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-[#FAFAFA]/80 hover:text-[#0EA5E9]"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Button
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              asChild
            >
              <a href={getAuthUrl("signup")}>Start Free</a>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#18181B]">
            <nav className="flex flex-col space-y-6 text-lg font-medium">
              <Link href="/#pricing" onClick={closeMenu}>
                Pricing
              </Link>
              <Link href="/contact" onClick={closeMenu}>
                Contact
              </Link>
              <Link href={getAuthUrl("login")} onClick={closeMenu}>
                Login
              </Link>
            </nav>
            <div className="mt-8 border-t border-[#0EA5E9]/20 pt-6">
              <Button asChild className="w-full">
                <a href={getAuthUrl("signup")} onClick={closeMenu}>
                  Start Monitoring Free
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
