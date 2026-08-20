import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 flex h-16 items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="EDC Logo" width={32} height={32} className="object-contain" />
            <span className="font-bold sm:inline-block">
              EDC NIAT X CDU
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/startup-flow" className="text-sm font-medium hover:underline underline-offset-4 px-4">
              Startup Flow
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4 px-4">
              About Us
            </Link>
            <Link href="/our-team" className="text-sm font-medium hover:underline underline-offset-4 px-4">
              Our Team
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4 px-4">
              Contact Us
            </Link>
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
