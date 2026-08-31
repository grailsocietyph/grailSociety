import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Information | Grail Society",
  description: "Get in touch with Grail Society. Visit our store or message us directly.",
};

export default function ContactInformationPage() {
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
              <MapPin className="h-3.5 w-3.5" />
              <span>Reach Out</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Contact Information
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Have a question or want to inquire about drops? We&apos;re here to help.
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
            {/* Location Card */}
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black text-white rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Physical Hub</p>
                  <p className="text-base font-bold text-neutral-900">EC Carwash</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Purok 3, Brgy. Bambang, Nagcarlan, Laguna
              </p>
              <p className="text-xs text-neutral-500">(Gray Apartment)</p>
            </div>

            {/* Phone Card */}
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black text-white rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Phone & SMS</p>
                  <p className="text-base font-bold text-neutral-900">09762183355</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                Available daily for call and SMS inquiries.
              </p>
              <a 
                href="tel:09762183355" 
                className="inline-block text-xs font-semibold text-black underline hover:text-neutral-600"
              >
                Call now →
              </a>
            </div>

            {/* Email Card */}
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black text-white rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Email Support</p>
                  <p className="text-sm font-bold text-neutral-900 truncate">grailsociety.ph@gmail.com</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                For brand collaborations, inquiries, and customer care.
              </p>
              <a 
                href="mailto:grailsociety.ph@gmail.com" 
                className="inline-block text-xs font-semibold text-black underline hover:text-neutral-600"
              >
                Send email →
              </a>
            </div>

            {/* Facebook Chat Card */}
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black text-white rounded-xl">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Official Chat</p>
                  <p className="text-base font-bold text-neutral-900">Facebook Messenger</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                Fastest way to order items and chat with our team.
              </p>
              <a 
                href="https://www.facebook.com/people/Grail-Society/100075987014852/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-black underline hover:text-neutral-600"
              >
                Message on Facebook →
              </a>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Location Map
            </h2>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100">
              <iframe
                title="Grail Society Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5471.78399522555!2d121.4132626490782!3d14.128123893021929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd5a244f53d2f9%3A0xd291a637de87ea35!2sEC%20Carwash!5e0!3m2!1sen!2sph!4v1788084657323!5m2!1sen!2sph"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
