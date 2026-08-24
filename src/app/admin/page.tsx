"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts, Product } from "@/context/ProductContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Edit, X, Upload, CheckSquare, Square, Package, ExternalLink, LogOut, Search, ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct, bulkPublish } = useProducts();
  const { isAuthenticated, logout } = useAdminAuth();
  const router = useRouter();

  // Auth Protection Effect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Selection Mode State for "Release Items"
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form states
  const [title, setTitle] = useState("");
  const [priceNum, setPriceNum] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("t-shirts");
  const [tagSize, setTagSize] = useState("M");
  
  // Dynamic measurement fields
  const [lengthVal, setLengthVal] = useState("");
  const [widthVal, setWidthVal] = useState("");
  const [waistVal, setWaistVal] = useState("");
  const [legOpeningVal, setLegOpeningVal] = useState("");
  const [notesVal, setNotesVal] = useState("");

  const [condition, setCondition] = useState("Brand-new / Dead-stock (10/10)");
  const [modelHeightFt, setModelHeightFt] = useState("5");
  const [modelHeightIn, setModelHeightIn] = useState("8");
  const [modelWeightKg, setModelWeightKg] = useState("81");
  const [images, setImages] = useState<string[]>([]);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isSoldOut, setIsSoldOut] = useState(false);

  if (!isAuthenticated) return null;

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setPriceNum("");
    setCollectionSlug("t-shirts");
    setTagSize("M");
    setLengthVal("");
    setWidthVal("");
    setWaistVal("");
    setLegOpeningVal("");
    setNotesVal("");
    setCondition("Brand-new / Dead-stock (10/10)");
    setModelHeightFt("5");
    setModelHeightIn("8");
    setModelWeightKg("81");
    setImages([]);
    setIsNewArrival(true);
    setIsSoldOut(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Product) => {
    setEditingId(item.id);
    setTitle(item.title);
    setPriceNum(item.priceNum.toString());
    setCollectionSlug(item.collectionSlug || "t-shirts");
    setTagSize(item.tagSize || "M");
    setLengthVal(item.measurementsData?.length || "");
    setWidthVal(item.measurementsData?.width || "");
    setWaistVal(item.measurementsData?.waist || "");
    setLegOpeningVal(item.measurementsData?.legOpening || "");
    setNotesVal(item.measurementsData?.notes || "");
    setCondition(item.condition || "");
    setModelHeightFt(item.modelHeightFt || "5");
    setModelHeightIn(item.modelHeightIn || "8");
    setModelWeightKg(item.modelWeightKg || "81");
    setImages(item.images || []);
    setIsNewArrival(!!item.isNewArrival);
    setIsSoldOut(!!item.isSoldOut);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 9 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string].slice(0, 9));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (targetStatus: "draft" | "published") => {
    if (!title || !priceNum) {
      alert("Please fill in all required fields (Title and Price).");
      return;
    }

    const num = parseFloat(priceNum) || 0;
    const priceFormatted = `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

    const measurementsData = ["accessories", "bags"].includes(collectionSlug)
      ? { notes: notesVal }
      : { length: lengthVal, width: widthVal, waist: waistVal, legOpening: legOpeningVal };

    const payload = {
      title,
      priceNum: num,
      priceFormatted,
      collectionSlug,
      tagSize,
      measurementsData,
      condition,
      modelHeightFt,
      modelHeightIn,
      modelWeightKg,
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9"],
      isNewArrival,
      status: targetStatus,
      isSoldOut,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

    setIsModalOpen(false);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleReleaseConfirm = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to release ${selectedIds.length} selected item(s) live?`)) {
      bulkPublish(selectedIds);
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  // Search Logic restricted to Title, Collection, and Price only
  const filteredProducts = products.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesCollection = (item.collectionSlug || "").toLowerCase().includes(q);
    const matchesPrice = (item.priceFormatted || "").toLowerCase().includes(q) || item.priceNum.toString().includes(q);

    return matchesTitle || matchesCollection || matchesPrice;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAccessoryOrBag = ["accessories", "bags"].includes(collectionSlug);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-helvetica">
      
      {/* High-Contrast Sticky Dark Top Header */}
      <header className="sticky top-0 z-40 w-full bg-neutral-900 text-white border-b border-neutral-800 shadow-sm">
        <div className="mx-auto max-w-360 px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center">
              <Image 
                src="/white-logo.png" 
                alt="Grail Society" 
                width={120} 
                height={36} 
                className="h-14 w-auto object-contain object-left brightness-0 invert" 
                priority 
              />
            </Link>
            <span className="text-[10px] bg-neutral-800 text-neutral-200 border border-neutral-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">ADMIN</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 rounded-xl border border-neutral-700/60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Live Website</span>
            </Link>
            <button
              onClick={() => { logout(); router.push("/admin/login"); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-950/40 hover:bg-red-950/70 px-4 py-2.5 rounded-xl border border-red-900/40 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Container with Light Neutral Background for Contrast */}
      <main className="mx-auto max-w-360 px-4 sm:px-8 py-10 w-full flex-1">
        
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Thrift Inventory Management</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage drops, specs, drafts, and publishing state.</p>
          </div>
          
          {/* Published and Drafts Count */}
          <div className="flex items-center gap-3 text-xs font-semibold text-neutral-600 bg-white px-4 py-2.5 rounded-xl border border-neutral-200 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Published: {products.filter((p) => p.status === "published").length}</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Drafts: {products.filter((p) => p.status === "draft").length}</span>
            </span>
          </div>
        </div>

        {/* Balanced Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="w-full md:w-80">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by title, collection, price..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {selectionMode ? (
              <div className="flex items-center gap-3 bg-white p-1.5 px-3 rounded-xl border border-neutral-300 shadow-sm">
                <span className="text-xs font-bold text-neutral-800">{selectedIds.length} selected</span>
                <button 
                  onClick={handleReleaseConfirm} 
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Release Items
                </button>
                <button 
                  onClick={() => { setSelectionMode(false); setSelectedIds([]); }} 
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-800 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white"
              >
                <Package className="h-4 w-4" />
                <span>Release Items</span>
              </button>
            )}

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Item Count Sub-header */}
        <div className="mb-4">
          <div className="text-sm text-neutral-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500 select-none">
                {selectionMode && <th className="py-3.5 px-4 w-10"></th>}
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Collection</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">New Arrival</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                      {selectionMode && (
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <button onClick={() => toggleSelectOne(item.id)} className="cursor-pointer flex items-center justify-center">
                              {isSelected ? <CheckSquare className="h-4 w-4 text-black" /> : <Square className="h-4 w-4 text-neutral-400" />}
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 bg-neutral-100 overflow-hidden rounded-lg">
                          <Image src={item.images[0] || ""} alt={item.title} fill unoptimized className="object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-900 max-w-xs truncate">{item.title}</td>
                      <td className="py-3 px-4 text-neutral-600 capitalize">{item.collectionSlug}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{item.priceFormatted}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full uppercase ${
                          item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-md ${item.isNewArrival ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"}`}>
                          {item.isNewArrival ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button onClick={() => openEditModal(item)} className="p-2 text-neutral-600 hover:text-black cursor-pointer" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deleteProduct(item.id)} className="p-2 text-red-500 hover:text-red-700 cursor-pointer" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-neutral-500">
                    No items found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Centered Pagination */}
        <div className="flex items-center justify-center mt-10 gap-4 text-xs font-medium text-neutral-700">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 hover:text-black disabled:opacity-25 cursor-pointer transition-opacity"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span>{currentPage} of {totalPages}</span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 hover:text-black disabled:opacity-25 cursor-pointer transition-opacity"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Redesigned Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl z-10 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-200 bg-neutral-50">
              <h2 className="text-lg font-bold text-neutral-950">
                {editingId ? "Edit Thrift Item" : "Add New Thrift Item"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4 bg-neutral-50/60 p-5 rounded-2xl border border-neutral-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Basic Information</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Product Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Arc'teryx Grotto Toque Beanie" 
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Price (₱) *</label>
                    <input 
                      type="number" 
                      required 
                      value={priceNum} 
                      onChange={(e) => setPriceNum(e.target.value)} 
                      placeholder="3900" 
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Collection Category</label>
                    <select 
                      value={collectionSlug} 
                      onChange={(e) => setCollectionSlug(e.target.value)} 
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors capitalize h-[46px]"
                    >
                      <option value="t-shirts">T-Shirts</option>
                      <option value="hoodies">Hoodies</option>
                      <option value="shorts">Shorts</option>
                      <option value="pants">Pants</option>
                      <option value="sweaters">Sweaters</option>
                      <option value="jackets">Jackets</option>
                      <option value="bags">Bags</option>
                      <option value="accessories">Accessories</option>
                      <option value="shoes">Shoes</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-6 border-t border-neutral-200/60 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer" />
                    <span className="text-sm font-medium text-neutral-800">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isSoldOut} onChange={(e) => setIsSoldOut(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer" />
                    <span className="text-sm font-medium text-neutral-800">Sold Out</span>
                  </label>
                </div>
              </div>

              {/* Thrift Specifications */}
              <div className="space-y-4 bg-neutral-50/60 p-5 rounded-2xl border border-neutral-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Thrift Specifications</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Tag Size</label>
                    <select 
                      value={tagSize} 
                      onChange={(e) => setTagSize(e.target.value)} 
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors h-[46px]"
                    >
                      <option value="One Size">One Size</option>
                      <option value="XS">XS (Extra Small)</option>
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL (Double XL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Condition</label>
                    <input type="text" value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="e.g. 9/10 Good Vintage Condition" className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>

                {isAccessoryOrBag ? (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">Accessory / Bag Notes</label>
                    <textarea 
                      value={notesVal} 
                      onChange={(e) => setNotesVal(e.target.value)} 
                      placeholder="e.g. Standard adult fit, adjustable straps..." 
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors resize-y min-h-[100px]"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">Length</label>
                      <input type="text" value={lengthVal} onChange={(e) => setLengthVal(e.target.value)} placeholder='28"' className="w-full px-3 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">Width</label>
                      <input type="text" value={widthVal} onChange={(e) => setWidthVal(e.target.value)} placeholder='22"' className="w-full px-3 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">Waist</label>
                      <input type="text" value={waistVal} onChange={(e) => setWaistVal(e.target.value)} placeholder='32"' className="w-full px-3 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">Leg Opening</label>
                      <input type="text" value={legOpeningVal} onChange={(e) => setLegOpeningVal(e.target.value)} placeholder='8"' className="w-full px-3 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black" />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div className="space-y-4 bg-neutral-50/60 p-5 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Product Images</h3>
                  <span className="text-xs text-neutral-500 font-medium">{images.length} / 9 uploaded</span>
                </div>
                
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-2xl p-6 cursor-pointer hover:border-black transition-colors bg-white">
                  <Upload className="h-6 w-6 text-neutral-500 mb-2" />
                  <span className="text-sm font-medium text-neutral-900">Click to upload image files</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative bg-white rounded-xl overflow-hidden border border-neutral-300 p-2 shadow-xs flex flex-col gap-2">
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100">
                          <Image src={img} alt={`Preview ${i}`} fill unoptimized className="object-cover" />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-black text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Main</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors"
                            title="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-neutral-200 flex items-center gap-4">
                <button type="button" onClick={() => handleSave("draft")} className="w-full py-3.5 bg-neutral-200 text-neutral-900 text-sm font-medium rounded-xl hover:bg-neutral-300 cursor-pointer">Save as Draft</button>
                <button type="button" onClick={() => handleSave("published")} className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/80 cursor-pointer">Publish Live</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}