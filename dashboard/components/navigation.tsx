"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Eye,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  Key,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCustomerInfo } from "@/hooks/use-api-data";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Events", href: "/events", icon: Eye },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, apiKey } = useAuth();
  const { customerInfo, loading: customerLoading } = useCustomerInfo(
    apiKey || undefined
  );

  // Generate initials from customer name or fallback to default
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName =
    customerInfo?.email?.split("@")[0] || customerInfo?.organization || "User";
  const initials = getInitials(displayName);

  return (
    <>
      {/* Header */}
      <header className="bg-[#18181B] border-b border-[rgba(250,250,250,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-[#0EA5E9]">
                  Kilometers.ai
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]"
                        : "text-[rgba(250,250,250,0.7)] hover:text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-[#0EA5E9] text-white text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 bg-[#18181B] border-[rgba(250,250,250,0.1)]"
                  align="end"
                >
                  {/* User Info Section */}
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-[#0EA5E9] text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#FAFAFA] truncate">
                          {customerLoading ? "Loading..." : displayName}
                        </p>
                        <p className="text-xs text-[rgba(250,250,250,0.7)] truncate">
                          {customerLoading
                            ? "..."
                            : customerInfo?.email || "No email"}
                        </p>
                        {customerInfo?.organization && (
                          <p className="text-xs text-[rgba(250,250,250,0.5)] truncate">
                            {customerInfo.organization}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Authentication Status */}
                    <div className="mt-3 pt-2 border-t border-[rgba(250,250,250,0.1)]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[rgba(250,250,250,0.7)]">
                          Authentication
                        </span>
                        {isAuthenticated ? (
                          <Badge className="bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Connected
                          </Badge>
                        )}
                      </div>
                      {!isAuthenticated && (
                        <p className="text-xs text-[rgba(250,250,250,0.5)] mt-1">
                          Configure your API key to access real-time data
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-[rgba(250,250,250,0.1)]" />

                  {/* Menu Items */}
                  <Link href="/profile">
                    <DropdownMenuItem className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)] cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)] cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="bg-[rgba(250,250,250,0.1)]" />

                  {/* API Key Status */}
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Key className="w-3 h-3 text-[rgba(250,250,250,0.7)]" />
                      <span className="text-xs text-[rgba(250,250,250,0.7)]">
                        API Key:{" "}
                        {apiKey ? `***${apiKey.slice(-4)}` : "Not configured"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="md:hidden ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#18181B] border-t border-[rgba(250,250,250,0.1)]">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]"
                        : "text-[rgba(250,250,250,0.7)] hover:text-[#FAFAFA] hover:bg-[rgba(14,165,233,0.1)]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Mobile Authentication Status */}
              <div className="px-3 py-3 mt-4 border-t border-[rgba(250,250,250,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgba(250,250,250,0.7)]">
                    Authentication Status
                  </span>
                  {isAuthenticated ? (
                    <Badge className="bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[rgba(250,250,250,0.5)] mt-2">
                  {isAuthenticated
                    ? `Logged in as ${displayName}`
                    : "Configure your API key in Settings to access real-time data"}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
