import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Connect Developers to Open Source Projects
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Find and claim bounties for open source contributions. Get paid
                for your work or find developers for your projects.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg">Join Now</Button>
              </Link>
              <Link href="/bounties">
                <Button variant="outline" size="lg">
                  Browse Bounties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                How DevBounty Works
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Our platform connects open source projects with talented
                developers
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                1
              </div>
              <h3 className="text-xl font-bold">Post a Bounty</h3>
              <p className="text-gray-500">
                Project owners post bounties for features, bug fixes, or other
                contributions
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                2
              </div>
              <h3 className="text-xl font-bold">Claim & Work</h3>
              <p className="text-gray-500">
                Developers claim bounties and submit pull requests to complete
                the work
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                3
              </div>
              <h3 className="text-xl font-bold">Get Paid</h3>
              <p className="text-gray-500">
                Once work is approved, developers receive payment for their
                contributions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to start?
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Join our community of developers and project owners today
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-background text-primary hover:bg-background/90"
                >
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
