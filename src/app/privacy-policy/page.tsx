import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Grail Society",
  description: "Privacy policy and data protection information for Grail Society.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica text-neutral-900">
      <div>
        <Header />

        <div className="mx-auto max-w-4xl px-4 sm:px-8 pt-28 sm:pt-36 pb-20">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          {/* Page Header */}
          <div className="border-b border-neutral-100 pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 text-[11px] font-bold uppercase tracking-wider rounded-full mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Legal & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Privacy Policy
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Last updated: August 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                1. Overview
              </h2>
              <p>
                At <strong>Grail Society</strong>, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you browse our store and place orders with us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                2. Information We Collect
              </h2>
              <p>
                When you browse our website or communicate with us to order products, we may collect the following information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li><strong>Contact details:</strong> Name, phone number, shipping address, and email address provided during order inquiries.</li>
                <li><strong>Order preferences:</strong> Items of interest, sizing inquiries, and order notes communicated via our Facebook page chat or email.</li>
                <li><strong>Browsing data:</strong> Non-personally identifiable technical logs (such as browser type and device type) to ensure site reliability.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                3. How We Use Your Information
              </h2>
              <p>
                We use the information collected solely for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li>Processing, packing, and dispatching your orders.</li>
                <li>Communicating with you regarding order status, sizing inquiries, or delivery updates.</li>
                <li>Providing customer support and answering questions.</li>
                <li>Improving our catalog selection and online storefront experience.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                4. Information Sharing & Third Parties
              </h2>
              <p>
                We do not sell, rent, or trade your personal information to any third parties. Your delivery information is only shared with trusted courier and logistics partners (such as LBC, J&T, or local couriers) strictly for order fulfillment.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                5. Data Security
              </h2>
              <p>
                We implement practical security measures to keep your personal data confidential and protected against unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                6. Contact Us
              </h2>
              <p>
                If you have any questions or concerns regarding our privacy practices, please reach out to us:
              </p>
              <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs sm:text-sm space-y-1.5 text-neutral-800">
                <p><strong>Grail Society</strong></p>
                <p>Location: Purok 3, Brgy. Bambang, Nagcarlan, Laguna (EC Carwash / Gray Apartment)</p>
                <p>Phone: 09762183355</p>
                <p>Email: grailsociety.ph@gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
