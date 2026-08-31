import Header from "@/components/header";
import Collections from "@/components/collections";
import Footer from "@/components/footer";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
      <div>
        <Header />
        {/* Top padding offset to ensure content sits nicely below fixed header */}
        <div className="pt-20 sm:pt-24">
          <Collections />
        </div>
      </div>
      <Footer />
    </main>
  );
}