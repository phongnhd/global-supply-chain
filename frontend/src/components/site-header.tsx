import Link from "next/link";
import { WalletToolbar } from "@/components/sui/wallet-toolbar";
import { ScrambleText } from "@/components/ui/scramble-text";
import Image from "next/image";
type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const links: NavLink[] = [
  { href: "/create", label: "Create" },
  { href: "/verify", label: "Verify" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-teal-500/10 bg-background/70 backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.05)]">
      <div className="flex w-full items-center px-4 md:px-8 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/icon.png" alt="Global Supply Chain" width={56} height={56} />
          <span className="text-lg font-bold text-black">
            Global
          </span>
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-lg font-semibold text-black">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <ScrambleText text={l.label} />
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <WalletToolbar />
          <Link href="/login" className="rounded-md bg-[#298dff] px-4 py-1 text-sm font-semibold text-white hover:shadow-[0_0_8px_rgba(41,141,255,0.25)]" >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}