import { BirthCertificateForm } from "@/components/forms/birth-certificate-form";

export default function ArtisanCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-center py-2">
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Export Customs Declaration
          </h1>

          <div className="mx-auto mt-4 h-1 w-20 bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        </div>
      </div>
      <BirthCertificateForm />
    </div>
  );
}
