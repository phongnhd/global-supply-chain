import Link from "next/link";

const metricCards = [
  {
    label: "Active Shipments",
    value: "1,284",
    change: "+9.4%",
    trend: "up",
  },
  {
    label: "Verification Rate",
    value: "98.6%",
    change: "+1.2%",
    trend: "up",
  },
  {
    label: "On-Time Delivery",
    value: "94.1%",
    change: "-0.4%",
    trend: "down",
  },
  {
    label: "Risk Alerts",
    value: "17",
    change: "-3 today",
    trend: "up",
  },
];

const shipmentRows = [
  {
    id: "SC-AX-20491",
    route: "Ho Chi Minh City -> Singapore",
    mode: "Maritime",
    status: "In Transit",
    eta: "Apr 28",
  },
  {
    id: "SC-RL-92815",
    route: "Da Nang -> Hanoi",
    mode: "Rail",
    status: "Delayed",
    eta: "Apr 27",
  },
  {
    id: "SC-AW-77502",
    route: "Bangkok -> Seoul",
    mode: "Aviation",
    status: "Arrived",
    eta: "Delivered",
  },
  {
    id: "SC-OR-66124",
    route: "Can Tho -> Rotterdam",
    mode: "Origin",
    status: "Pending Docs",
    eta: "Apr 30",
  },
];

const quickActions = [
  { title: "Create Origin Certificate", href: "/create" },
  { title: "Verify Product Hash", href: "/verify" },
  { title: "Track Air Shipment", href: "/aviation" },
  { title: "Monitor Sea Container", href: "/maritime" },
  { title: "Open Rail Operations", href: "/railway" },
  { title: "Support & Escalations", href: "/support" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-8 text-white shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-blue-400/30 blur-2xl" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                Global Command Center
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Supply Chain Dashboard
              </h1>
              <p className="max-w-2xl text-sm text-blue-100 sm:text-base">
                Oversee origin, transit, and final verification in one streamlined view powered by Sui blockchain integrity.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/create"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-blue-100">
                  New Certificate
                </Link>
                <Link
                  href="/verify"
                  className="rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                  Verify Product
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-blue-100">Network Health</p>
              <p className="mt-2 text-3xl font-semibold">99.92%</p>
              <p className="mt-1 text-sm text-blue-100">Consensus uptime across active verification nodes</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Certificates minted</span>
                  <span className="font-semibold text-white">57,832</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Cross-border lanes</span>
                  <span className="font-semibold text-white">412</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Open disputes</span>
                  <span className="font-semibold text-emerald-300">2</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
              <p className={`mt-1 text-sm font-medium ${metric.trend === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                {metric.change}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Live Shipment Board</h2>
              <Link href="/contact" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                View all routes
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Shipment ID</th>
                    <th className="pb-3 pr-4 font-medium">Route</th>
                    <th className="pb-3 pr-4 font-medium">Mode</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-none">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{row.id}</td>
                      <td className="py-3 pr-4 text-slate-600">{row.route}</td>
                      <td className="py-3 pr-4 text-slate-600">{row.mode}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{row.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">Fast access to core operational flows.</p>
            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                  {action.title}
                  <span className="text-slate-400 transition group-hover:text-blue-700">→</span>
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}