import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/db/supabase/client";
import { ArrowRight, Briefcase, Check, Code, Users } from "lucide-react";
import Link from "next/link";

async function getStats() {
  try {
    const supabase = createClient();
    // Get total bounties created
    const { count: totalBounties } = await supabase
      .from("bounties")
      .select("*", { count: "exact", head: true });

    // Get total completed bounties
    const { count: completedBounties } = await supabase
      .from("bounties")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Get total users (clients + developers)
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    return {
      totalBounties: totalBounties || 0,
      completedBounties: completedBounties || 0,
      totalUsers: totalUsers || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalBounties: 0,
      completedBounties: 0,
      totalUsers: 0,
    };
  }
}

export default async function Home() {
  const stats = await getStats();

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-24 sm:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                Connect with developers to solve your coding issues
              </h1>
              <p className="text-xl text-muted-foreground">
                DevBounty is the platform that connects clients with talented
                developers to get coding tasks done quickly and efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/post-bounty">
                  <Button size="lg" className="w-full sm:w-auto">
                    Post a Bounty <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/bounties">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Find Work
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-lg bg-background border p-6 shadow-lg">
                <div className="absolute -top-4 -left-4 rounded-full bg-primary text-primary-foreground p-3">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Bug Fix Bounty</h3>
                <p className="text-muted-foreground mb-4">
                  Need help fixing a critical bug in our React application. The
                  login page isn't working properly.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">$150</span>
                  <span className="bg-muted text-muted-foreground text-sm px-2 py-1 rounded">
                    2 days remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-background border-t border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <span className="text-4xl font-bold">{stats.totalBounties}</span>
              <p className="text-muted-foreground">Bounties Posted</p>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-bold">
                {stats.completedBounties}
              </span>
              <p className="text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-bold">{stats.totalUsers}</span>
              <p className="text-muted-foreground">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">
              A simple process to get your coding tasks completed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Post a Bounty</h3>
              <p className="text-muted-foreground">
                Describe your task, set your budget, and post your bounty for
                developers to see.
              </p>
            </div>
            <div className="bg-background border rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Find a Developer</h3>
              <p className="text-muted-foreground">
                Talented developers will claim your bounty and start working on
                your task.
              </p>
            </div>
            <div className="bg-background border rounded-lg p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Task Completed</h3>
              <p className="text-muted-foreground">
                Review the work, provide feedback, and release payment when
                satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What People Say</h2>
            <p className="text-muted-foreground mt-2">
              Testimonials from our satisfied clients and developers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted/20 border rounded-lg p-6">
              <p className="italic mb-4">
                "DevBounty helped me find the perfect developer for my project.
                The bug was fixed within 24 hours!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-sm text-muted-foreground">
                    Startup Founder
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-muted/20 border rounded-lg p-6">
              <p className="italic mb-4">
                "As a freelance developer, DevBounty gives me access to
                interesting projects that match my skills perfectly."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">JS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jane Smith</h4>
                  <p className="text-sm text-muted-foreground">
                    Frontend Developer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">
              Find answers to common questions about DevBounty
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I post a bounty?</AccordionTrigger>
                <AccordionContent>
                  Sign up for an account, click on "Post a Bounty," and fill out
                  the form with details about your task, requirements, and
                  budget. Once submitted, developers can view and claim your
                  bounty.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  How much does it cost to use DevBounty?
                </AccordionTrigger>
                <AccordionContent>
                  DevBounty takes a small percentage fee from each completed
                  bounty. Posting a bounty is free, and you only pay when you're
                  satisfied with the work delivered.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  What types of tasks can I post?
                </AccordionTrigger>
                <AccordionContent>
                  You can post a wide range of coding tasks including bug fixes,
                  feature development, code reviews, performance optimizations,
                  and more. Both frontend and backend tasks are welcome.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do developers get paid?</AccordionTrigger>
                <AccordionContent>
                  When a client approves the completed work, the bounty amount
                  is released to the developer through our secure payment
                  system. We support multiple payment methods for convenience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  What if I'm not satisfied with the work?
                </AccordionTrigger>
                <AccordionContent>
                  We have a dispute resolution process in place. If you're not
                  satisfied, you can request revisions or open a dispute. Our
                  team will review the situation and help find a fair
                  resolution.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join the DevBounty community today and connect with talented
            developers to solve your coding challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create an Account
              </Button>
            </Link>
            <Link href="/bounties">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground hover:bg-primary-foreground/10"
              >
                Browse Bounties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
