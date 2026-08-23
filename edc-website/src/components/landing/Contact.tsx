"use client";

import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Contact Us</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s build something great together.
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have a question about the incubation program, or want to partner with us? Fill out the form below or reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mx-auto max-w-5xl">
          <div className="flex flex-col gap-10">
            <div className="rounded-2xl bg-muted/30 border p-8">
              <h3 className="text-xl font-bold mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex gap-x-4 items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a href="mailto:edc@niat.edu" className="text-muted-foreground hover:text-primary transition-colors">edc@niat.edu</a>
                  </div>
                </div>
                <div className="flex gap-x-4 items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p className="text-muted-foreground">+91 93928 01138</p>
                  </div>
                </div>
                <div className="flex gap-x-4 items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">LOCATION</p>
                    <p className="text-muted-foreground">NIAT X CDU</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-3xl border shadow-xl p-8 sm:p-10">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Send us a message
            </h3>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const subject = encodeURIComponent(String(data.get("subject") || "EDC Inquiry"))
                const body = encodeURIComponent(
                  `${data.get("message") || ""}\n\n— ${data.get("name") || "Anonymous"} (${data.get("email") || "no email"})`
                )
                window.location.href = `mailto:edc@niat.edu?subject=${subject}&body=${body}`
              }}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-foreground">Full Name</label>
                <div className="mt-2">
                  <input type="text" name="name" id="name" className="block w-full rounded-md border-0 py-2.5 px-3.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">Email Address</label>
                <div className="mt-2">
                  <input type="email" name="email" id="email" className="block w-full rounded-md border-0 py-2.5 px-3.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium leading-6 text-foreground">Subject</label>
                <div className="mt-2">
                  <input type="text" name="subject" id="subject" className="block w-full rounded-md border-0 py-2.5 px-3.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background" placeholder="Incubation Inquiry" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium leading-6 text-foreground">Message</label>
                <div className="mt-2">
                  <textarea id="message" name="message" rows={4} className="block w-full rounded-md border-0 py-2.5 px-3.5 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background" placeholder="Tell us about your startup or inquiry..." />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
