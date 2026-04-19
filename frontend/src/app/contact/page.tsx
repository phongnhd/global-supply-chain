import Link from "next/link";
import { MapPin, Mail, MessageCircle, Link2 } from "lucide-react";
export default function ContactPage() {
  return (
    <main className="min-h-screen pt-2 px-6 sm:px-12 lg:px-24">
      <section className="mb-5 text-center">
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-4xl">
          Contact Us
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
          Have questions about the supply chain platform, Sui integration, or enterprise solutions?
          We’re here to help.
        </p>
      </section>

      {/* Contact layout */}
      <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Send a message
          </h2>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
            />

            <input
              type="email"
              placeholder="Your email"
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
            />

            <textarea
              placeholder="Your message..."
              rows={5}
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-teal-500"
            />

            <button
              type="submit"
              className="w-full rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 hover:shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Contact Information
          </h2>

        <div className="space-y-4 text-sm text-gray-700">
  
  <p className="flex items-start gap-2">
    <MapPin className="mt-0.5 h-4 w-4 text-teal-600" />
    <span>
      <span className="font-medium text-gray-900">Location:</span>{" "}
      Ho Chi Minh City, Vietnam
    </span>
  </p>

  <p className="flex items-start gap-2">
    <Mail className="mt-0.5 h-4 w-4 text-teal-600" />
    <span>
      <span className="font-medium text-gray-900">Email:</span>{" "}
      support@globalsupplychain.io
    </span>
  </p>

  <p className="flex items-start gap-2">
    <MessageCircle className="mt-0.5 h-4 w-4 text-teal-600" />
    <span>
      <span className="font-medium text-gray-900">Support:</span>{" "}
      24/7 technical assistance for enterprise users
    </span>
  </p>

  <p className="flex items-start gap-2">
    <Link2 className="mt-0.5 h-4 w-4 text-teal-600" />
    <span>
      <span className="font-medium text-gray-900">Blockchain:</span>{" "}
      Powered by Sui Network
    </span>
  </p>

</div>

          <div className="mt-6 border-t pt-4">
            <Link
              href="/"
              className="text-sm font-semibold text-teal-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-20 max-w-6xl border-t border-gray-300 pt-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Global Supply Chain · Secure communication channel
        </p>
      </footer>
    </main>
  );
}