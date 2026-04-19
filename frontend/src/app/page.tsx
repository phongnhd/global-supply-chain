import Link from "next/link";

const tiles = [
  {
    title: "Origin",
    desc: "Issue a product origin certificate (metadata + hash) at the source.",
    href: "/create",
  },
  {
    title: "Air Transport",
    desc: "Track AWB shipments, flights, and transit hubs in real time.",
    href: "/aviation",
  },
  {
    title: "Sea Freight",
    desc: "Manage containers, vessels (IMO), and global port routes.",
    href: "/maritime",
  },
  {
    title: "Rail Transport",
    desc: "Monitor railcars, stations, and cross-route shipment status.",
    href: "/railway",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-2 sm:px-12 lg:px-24">
      <section className="mb-5 text-center">
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Trace & Verify
        </h1>

        <div className="mx-auto mb-4 h-1 w-20 bg-teal-500 shadow-[0_0_14px_rgba(20,184,166,0.9)]"></div>
      </section>

      <section className="mx-auto mb-10 max-w-4xl space-y-6 text-center">
        <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
          A transparent supply chain platform powered by{" "}
          <strong className="font-semibold text-gray-900">Sui Blockchain</strong> for secure and immutable verification.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/create"
            className="rounded-md bg-gray-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg">
            Create Origin Certificate
          </Link>

          <Link
            href="/verify"
            className="rounded-md border-2 border-gray-900 bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white" >
            Verify & Authenticate
          </Link>
        </div>
      </section>

<section className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {tiles.map((t) => (
    <Link
      key={t.href}
      href={t.href}
      className="
        group block rounded-lg
        border-2 border-gray-200
        bg-white p-6
        transition-all duration-300
        hover:border-[#298dff]
        hover:shadow-lg
      "
    >
      <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-[#298dff]">
        {t.title}
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-gray-600">
        {t.desc}
      </p>

      <span className="inline-flex items-center text-sm font-semibold text-[#298dff] group-hover:underline">
        Open module →
      </span>
    </Link>
  ))}
</section>

      <footer className="mx-auto mt-20 max-w-6xl border-t border-gray-300 pt-8 text-center">
        <p className="text-sm text-gray-500">
       © {new Date().getFullYear()} Global Supply Chain · Secured & Verified by Sui Blockchain
        </p>
      </footer>
    </main>
  );
}