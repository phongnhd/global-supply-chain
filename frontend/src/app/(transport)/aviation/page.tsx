import { AviationForm } from "@/components/forms/aviation-form";

export default function AviationPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Air Shipment Declaration
        </h1>

        <div className="mx-auto mt-4 h-1 w-20 bg-violet-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
      </div>
      <AviationForm />
    </div>
  );
}
