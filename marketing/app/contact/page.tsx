"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Mail, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { featureFlags } from "@/lib/feature-flags";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Message sent!", {
          description: "Thanks for reaching out. We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        const errorData = await response.json();
        toast.error("Failed to send message", {
          description:
            errorData.body || "An unexpected error occurred. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to send message", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="bg-[#18181B] border-[#0EA5E9]/20">
      <CardHeader>
        <CardTitle className="text-2xl">Get in touch</CardTitle>
        <CardDescription className="text-[#FAFAFA]/70">
          Ready to scale your AI monitoring? Let's talk about your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-[#0A0A0A] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[#0A0A0A] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="bg-[#0A0A0A] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
              placeholder="Tell us about your AI monitoring needs..."
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ContactPageContent() {
  if (featureFlags.ENABLE_CONTACT_FORM) {
    return <ContactForm />;
  }

  return (
    <Card className="bg-[#18181B] border-[#0EA5E9]/20 text-center">
      <CardContent className="p-10">
        <Mail className="h-12 w-12 text-[#0EA5E9] mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
        <p className="text-[#FAFAFA]/70">
          For support or inquiries, please reach out to us directly. Our contact
          form is currently under maintenance.
        </p>
      </CardContent>
    </Card>
  );
}

export default function ContactPage() {
  return (
    <>
      <Toaster theme="dark" />
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <ContactPageContent />

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="h-6 w-6 text-[#0EA5E9]" />
                    <h3 className="text-lg font-semibold">Quick Response</h3>
                  </div>
                  <p className="text-[#FAFAFA]/70">
                    We typically respond within 24 hours. For urgent matters,
                    reach out on our Discord.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="h-6 w-6 text-[#0EA5E9]" />
                    <h3 className="text-lg font-semibold">Schedule a Demo</h3>
                  </div>
                  <p className="text-[#FAFAFA]/70 mb-4">
                    Want to see Kilometers in action? Book a personalized demo
                    with our team.
                  </p>
                  <Button
                    variant="outline"
                    className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                  >
                    Book demo call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
