import Header from "@/components/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Truck, RotateCcw, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Shopping Policy | Grail Society",
  description: "Ordering, shipping, payments, and condition guide policies for Grail Society.",
};

export default function ShoppingPolicyPage() {
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
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Store Guide</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              Shopping & Shipping Policy
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Everything you need to know about ordering and deliveries at Grail Society.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
            {/* How Ordering Works */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-900 font-bold text-lg">
                <ShoppingBag className="h-5 w-5 stroke-[2]" />
                <h2>1. How Ordering Works</h2>
              </div>
              <p>
                To keep our checkout personal and ensure item availability, we process orders directly through our official Facebook page:
              </p>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800 space-y-2 text-xs sm:text-sm">
                <p><strong>Step 1:</strong> Find the piece you want and click <b>&ldquo;Copy Order Details&rdquo;</b> on the product page.</p>
                <p><strong>Step 2:</strong> Paste the text directly into our Facebook Messenger chat: <a href="https://www.facebook.com/people/Grail-Society/100075987014852/" target="_blank" rel="noopener noreferrer" className="font-bold underline text-black">Grail Society on Facebook</a>.</p>
                <p><strong>Step 3:</strong> Our team will confirm availability, assist with payment, and dispatch your package!</p>
              </div>
            </section>

            {/* Vintage & Thrift Condition */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-900 font-bold text-lg">
                <HelpCircle className="h-5 w-5 stroke-[2]" />
                <h2>2. Thrift & Vintage Condition Guide</h2>
              </div>
              <p>
                Our pieces are authentic, curated thrift and vintage items. Each item is unique (1 of 1). We inspect and document the exact tag size, detailed measurements (length, width, waist), and condition rating on each product page.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li><strong>Brand New / Deadstock:</strong> Never worn, brand new with or without original tags.</li>
                <li><strong>Excellent Condition:</strong> Pre-loved with minimal to no signs of wear.</li>
                <li><strong>Good / Fair Vintage:</strong> Normal vintage character and wash wear, documented in photos.</li>
              </ul>
            </section>

            {/* Shipping & Delivery */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-900 font-bold text-lg">
                <Truck className="h-5 w-5 stroke-[2]" />
                <h2>3. Shipping Rates & Timeframes</h2>
              </div>
              <p>
                <strong>Bonus: FREE shipping is included on every item nationwide!</strong>
              </p>
              <p>
                Orders are packed and dispatched within 24 to 48 hours following payment confirmation. Estimated delivery times:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                <li><strong>Luzon & Metro Manila:</strong> 2 to 4 business days.</li>
                <li><strong>Visayas & Mindanao:</strong> 4 to 7 business days.</li>
              </ul>
            </section>

            {/* Returns & Exchanges */}
            <section className="space-y-3">
              <div className="flex items-center gap-2.5 text-neutral-900 font-bold text-lg">
                <RotateCcw className="h-5 w-5 stroke-[2]" />
                <h2>4. Returns & Exchanges</h2>
              </div>
              <p>
                Due to the one-of-a-kind nature of vintage and thrifted garments, <strong>all sales are final</strong>. We provide detailed measurements on every item page to help you verify fit prior to checkout. Please feel free to message us with any questions before placing your order.
              </p>
            </section>

            {/* Need Assistance */}
            <section className="space-y-3 pt-6 border-t border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Need Assistance?
              </h2>
              <p>
                Have questions about an item, sizing, or shipment? Contact our team at:
              </p>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs sm:text-sm space-y-1 text-neutral-800">
                <p>Phone: <strong>09762183355</strong></p>
                <p>Email: <strong>grailsociety.ph@gmail.com</strong></p>
                <p>Location: <strong>Purok 3, Brgy. Bambang, Nagcarlan, Laguna</strong></p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
