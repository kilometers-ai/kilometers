"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center p-4">
      <Card className="bg-[#18181B] border-[#EF4444]/20 max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-[#EF4444]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-[#FAFAFA]/80 mb-8 max-w-lg mx-auto">
            Our AI monitoring detected an unexpected error. Don't worry, we're on it! Try refreshing the page or contact
            support if the problem persists.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-[#0A0A0A] rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-[#EF4444] mb-2">Error Details (Development Only):</h3>
              <pre className="text-sm text-[#FAFAFA]/70 whitespace-pre-wrap overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10 bg-transparent"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 bg-transparent"
              asChild
            >
              <Link href="/contact">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
