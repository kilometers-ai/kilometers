"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, FileText, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  const quickLinks = [
    { name: "Homepage", href: "/", icon: Home },
    { name: "Documentation", href: "/docs", icon: FileText },
    { name: "Contact Support", href: "/contact", icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-[#0EA5E9] mb-4 animate-pulse">404</div>
          <div className="w-32 h-1 bg-gradient-to-r from-[#0EA5E9] to-transparent mx-auto mb-6"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold mb-4">Your AI went off the map</h1>
        <p className="text-xl text-[#FAFAFA]/80 mb-8 max-w-lg mx-auto">
          The page you're looking for doesn't exist, but don't worry – even the best AI agents sometimes take wrong
          turns.
        </p>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickLinks.map((link, index) => (
            <Card key={index} className="bg-[#18181B] border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <link.icon className="h-6 w-6 text-[#0EA5E9]" />
                </div>
                <h3 className="font-semibold mb-2">{link.name}</h3>
                <Button asChild size="sm" className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                  <Link href={link.href}>Visit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Suggestion */}
        <div className="mb-8">
          <p className="text-[#FAFAFA]/70 mb-4">Looking for something specific?</p>
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FAFAFA]/50" />
              <input
                type="text"
                placeholder="Search our docs..."
                className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#0EA5E9]/20 rounded-lg text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.location.href = `/docs?search=${encodeURIComponent(e.currentTarget.value)}`
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Back Home */}
        <Button asChild size="lg" className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
