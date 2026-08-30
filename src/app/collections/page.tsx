import Header from "@/components/header";
import Collections from "@/components/collections";
import Footer from "@/components/footer";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between font-helvetica">
      <div>
        <Header />
        {/* Top padding pt-16 sm:pt-20 ensures content sits below fixed/absolute header */}
        <div className="pt-16 sm:pt-20">
          <Collections />
        </div>
      </div>
      <Footer />
    </main>
  );
}