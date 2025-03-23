import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-2xl">DevBounty</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
      <footer className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} DevBounty. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link
            href="/terms"
            className="text-sm text-gray-500 hover:underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-500 hover:underline underline-offset-4"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
