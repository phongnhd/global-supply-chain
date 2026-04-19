import { RailwayForm } from "@/components/forms/railway-form";

export default function RailwayPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Rail Freight Declaration
        </h1>

        <div className="mx-auto mt-4 h-1 w-20 bg-orange-600 shadow-[0_0_12px_rgba(234,88,12,0.6)]" />
      </div>
      <RailwayForm />
    </div>
  );
}
