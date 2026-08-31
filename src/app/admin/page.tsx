"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts, Product } from "@/context/ProductContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAnnouncement } from "@/context/AnnouncementContext";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Upload,
  CheckSquare,
  Square,
  Package,
  ExternalLink,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  RefreshCw,
  AlertCircle,
  Megaphone,
  Check,
  Eye,
  ShoppingBag,
  Copy,
  Gift,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkPublish,
    bulkDraft,
    bulkDelete,
    refreshProducts,
  } = useProducts();
  const { isAuthenticated, isAuthLoaded, logout } = useAdminAuth();
  const { announcement, updateAnnouncement, deleteAnnouncement } = useAnnouncement();
  const router = useRouter();

  // Auth Protection Effect
  useEffect(() => {
    if (isAuthLoaded && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthLoaded, isAuthenticated, router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"edit" | "preview">("edit");
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Announcement modal & state
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState(announcement?.text || "");
  const [announcementLink, setAnnouncementLink] = useState(announcement?.link || "");
  const [announcementActive, setAnnouncementActive] = useState(announcement?.isActive ?? true);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [announcementSavedSuccess, setAnnouncementSavedSuccess] = useState(false);

  // Form errors state for inline field validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Selection Mode State for "Release Items" or bulk management
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 8 items per page before advancing to page 2

  // Form states - initial clean empty values (no pre-filled static mock data)
  const [title, setTitle] = useState("");
  const [priceNum, setPriceNum] = useState("");
  const [collectionSlug, setCollectionSlug] = useState("t-shirts");
  const [tagSize, setTagSize] = useState("N/A");

  // Dynamic measurement & details fields
  const [lengthVal, setLengthVal] = useState("");
  const [widthVal, setWidthVal] = useState("");
  const [waistVal, setWaistVal] = useState("");
  const [legOpeningVal, setLegOpeningVal] = useState("");
  const [notesVal, setNotesVal] = useState("");

  const [condition, setCondition] = useState("");
  const [issue, setIssue] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);

  // Drag and drop state for images
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-helvetica px-4">
        <div className="flex items-center gap-2 text-neutral-600 text-sm bg-white p-4 rounded-2xl shadow-sm border border-neutral-200">
          <Loader2 className="h-4 w-4 animate-spin text-neutral-900" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Category helpers for dynamic rendering
  const isTopOrOuterwear = ["t-shirts", "hoodies", "sweaters", "jackets"].includes(collectionSlug);
  const isBottoms = ["shorts", "pants"].includes(collectionSlug);
  const isBagsOrAccessories = ["bags", "accessories"].includes(collectionSlug);
  const isShoes = collectionSlug === "shoes";

  const openAddModal = () => {
    setEditingId(null);
    setActiveModalTab("edit");
    setPreviewImageIndex(0);
    setCopiedPreview(false);
    setTitle("");
    setPriceNum("");
    setCollectionSlug("t-shirts");
    setTagSize("N/A");
    setLengthVal("");
    setWidthVal("");
    setWaistVal("");
    setLegOpeningVal("");
    setNotesVal("");
    setCondition("");
    setIssue("");
    setImages([]);
    setIsNewArrival(false);
    setIsSoldOut(false);
    setUploadError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Product) => {
    setEditingId(item.id);
    setActiveModalTab("edit");
    setPreviewImageIndex(0);
    setCopiedPreview(false);
    setTitle(item.title || "");
    setPriceNum(item.priceNum ? item.priceNum.toString() : "");
    setCollectionSlug(item.collectionSlug || "t-shirts");
    setTagSize(item.tagSize || "N/A");
    setLengthVal(item.measurementsData?.length || "");
    setWidthVal(item.measurementsData?.width || "");
    setWaistVal(item.measurementsData?.waist || "");
    setLegOpeningVal(item.measurementsData?.legOpening || "");
    setNotesVal(item.measurementsData?.notes || "");
    setCondition(item.condition || "");
    setIssue(item.issue || item.measurementsData?.issue || "");
    setImages(item.images || []);
    setIsNewArrival(!!item.isNewArrival);
    setIsSoldOut(!!item.isSoldOut);
    setUploadError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openAnnouncementModal = () => {
    setAnnouncementText(announcement?.text || "");
    setAnnouncementLink(announcement?.link || "");
    setAnnouncementActive(announcement?.isActive ?? true);
    setAnnouncementSavedSuccess(false);
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    setIsSavingAnnouncement(true);
    try {
      await updateAnnouncement({
        text: announcementText.trim(),
        link: announcementLink.trim(),
        isActive: announcementActive,
      });
      setAnnouncementSavedSuccess(true);
      setTimeout(() => {
        setIsAnnouncementModalOpen(false);
        setAnnouncementSavedSuccess(false);
      }, 900);
    } catch (err) {
      console.error("Failed to save announcement:", err);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (confirm("Are you sure you want to delete and completely remove this announcement?")) {
      setIsSavingAnnouncement(true);
      try {
        await deleteAnnouncement();
        setIsAnnouncementModalOpen(false);
      } catch (err) {
        console.error("Failed to delete announcement:", err);
      } finally {
        setIsSavingAnnouncement(false);
      }
    }
  };

  // Image Upload handler with limit checking and error handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    if (images.length >= 9) {
      setUploadError("Maximum 9 images allowed per product. Please delete an image first.");
      e.target.value = "";
      return;
    }

    const remainingSlots = 9 - images.length;
    if (files.length > remainingSlots) {
      setUploadError(`You can only upload up to ${remainingSlots} more image(s). You selected ${files.length}.`);
      e.target.value = "";
      return;
    }

    // Validate image format and file size (< 10MB)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        setUploadError(`"${file.name}" is not an image file. Supported formats: JPG, PNG, WEBP, GIF.`);
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller image.`);
        e.target.value = "";
        return;
      }
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setUploadingCount(filesToProcess.length);

    try {
      // Upload each file individually in parallel so request payload limits are never exceeded
      const uploadPromises = filesToProcess.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || (!data.url && !data.urls)) {
          throw new Error(data.error || `Failed to upload "${file.name}"`);
        }
        return (data.url || data.urls?.[0]) as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls.filter(Boolean)].slice(0, 9));
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingCount(0);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (previewImageIndex >= images.length - 1) {
      setPreviewImageIndex(Math.max(0, images.length - 2));
    }
  };

  // Image Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const updatedImages = [...images];
    const draggedItem = updatedImages[draggedImageIndex];

    updatedImages.splice(draggedImageIndex, 1);
    updatedImages.splice(index, 0, draggedItem);

    setImages(updatedImages);
    setDraggedImageIndex(null);
  };

  // Strict Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Product title is required.";
    } else if (title.trim().length < 3) {
      newErrors.title = "Product title must be at least 3 characters.";
    }

    const parsedPrice = parseFloat(priceNum);
    if (!priceNum.trim()) {
      newErrors.priceNum = "Price is required.";
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.priceNum = "Please enter a valid price greater than 0.";
    }

    if (!condition.trim()) {
      newErrors.condition = "Condition specification is required.";
    }

    if (!isBagsOrAccessories && !tagSize) {
      newErrors.tagSize = "Please select or enter tag size.";
    }

    if (isTopOrOuterwear) {
      if (!lengthVal.trim()) {
        newErrors.lengthVal = "Length measurement is required.";
      }
      if (!widthVal.trim()) {
        newErrors.widthVal = "Width measurement is required.";
      }
    } else if (isBottoms) {
      if (!waistVal.trim()) {
        newErrors.waistVal = "Waist measurement is required.";
      }
      if (!lengthVal.trim()) {
        newErrors.lengthVal = "Length measurement is required.";
      }
      if (!legOpeningVal.trim()) {
        newErrors.legOpeningVal = "Leg opening measurement is required.";
      }
    } else if (isBagsOrAccessories || isShoes) {
      if (!notesVal.trim()) {
        newErrors.notesVal = "Details or notes are required.";
      }
    }

    if (images.length === 0) {
      newErrors.images = "At least one product photo is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (targetStatus: "draft" | "published") => {
    if (!validateForm()) {
      setActiveModalTab("edit"); // Jump to edit tab to show errors
      return;
    }

    setIsSaving(true);
    try {
      const num = parseFloat(priceNum) || 0;
      const priceFormatted = `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

      let measurementsData: Record<string, string | undefined> = {};
      if (["bags", "accessories"].includes(collectionSlug)) {
        measurementsData = { notes: notesVal.trim() };
      } else if (collectionSlug === "shoes") {
        measurementsData = { notes: notesVal.trim() };
      } else if (["shorts", "pants"].includes(collectionSlug)) {
        measurementsData = { waist: waistVal.trim(), length: lengthVal.trim(), legOpening: legOpeningVal.trim() };
      } else {
        measurementsData = { length: lengthVal.trim(), width: widthVal.trim() };
      }

      if (issue.trim()) {
        measurementsData.issue = issue.trim();
      }

      const finalTagSize = ["bags", "accessories"].includes(collectionSlug) ? "N/A" : tagSize;

      const payload = {
        title: title.trim(),
        priceNum: num,
        priceFormatted,
        collectionSlug,
        tagSize: finalTagSize,
        measurementsData,
        condition: condition.trim(),
        issue: issue.trim() || undefined,
        images,
        isNewArrival,
        status: targetStatus,
        isSoldOut,
        dateAdded: new Date().toISOString().split("T")[0],
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save item error:", err);
      alert("Failed to save product: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleReleaseConfirm = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to publish ${selectedIds.length} selected item(s) live?`)) {
      await bulkPublish(selectedIds);
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  const handleBulkDraft = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Set ${selectedIds.length} item(s) to draft status?`)) {
      await bulkDraft(selectedIds);
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedIds.length} item(s)?`)) {
      await bulkDelete(selectedIds);
      setSelectionMode(false);
      setSelectedIds([]);
    }
  };

  // Search Logic
  const filteredProducts = products.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesCollection = (item.collectionSlug || "").toLowerCase().includes(q);
    const matchesPrice =
      (item.priceFormatted || "").toLowerCase().includes(q) || item.priceNum.toString().includes(q);

    return matchesTitle || matchesCollection || matchesPrice;
  });

  // Pagination Logic (8 items per page)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Formatted price for live preview
  const livePriceFormatted = priceNum
    ? `₱${(parseFloat(priceNum) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "₱0.00";

  // Formatted measurements string for live preview
  const liveFormattedMeasurements = notesVal.trim()
    ? notesVal.trim()
    : [
      lengthVal.trim() ? `Length: ${lengthVal.trim()}` : "",
      widthVal.trim() ? `Width: ${widthVal.trim()}` : "",
      waistVal.trim() ? `Waist: ${waistVal.trim()}` : "",
      legOpeningVal.trim() ? `Leg Opening: ${legOpeningVal.trim()}` : "",
    ].filter(Boolean).join(" | ") || "N/A";

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-helvetica">
      {/* Sticky Dark Top Header */}
      <header className="sticky top-0 z-40 w-full bg-neutral-900 text-white border-b border-neutral-800 shadow-sm">
        <div className="mx-auto max-w-360 px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center">
              <Image
                src="/white-logo.png"
                alt="Grail Society"
                width={120}
                height={36}
                className="h-10 sm:h-14 w-auto object-contain object-left brightness-0 invert"
                priority
              />
            </Link>
            <span className="text-[10px] bg-neutral-800 text-neutral-200 border border-neutral-700 px-2 py-0.5 sm:py-1 rounded font-bold uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => refreshProducts()}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 px-2.5 sm:px-3 py-2 rounded-xl border border-neutral-700/60 cursor-pointer"
              title="Refresh database items"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Sync DB</span>
            </button>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 px-2.5 sm:px-4 py-2 rounded-xl border border-neutral-700/60"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View Store</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-950/40 hover:bg-red-950/70 px-2.5 sm:px-4 py-2 rounded-xl border border-red-900/40 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Container */}
      <main className="mx-auto max-w-360 px-4 sm:px-8 py-6 sm:py-10 w-full flex-1">
        {/* Top Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Thrift Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Manage your inventory, releases, drafts, and product specifications.
            </p>
          </div>

          {/* Metrics Summary Badge */}
          <div className="flex items-center gap-3 text-xs font-semibold text-neutral-600 bg-white px-3 sm:px-4 py-2.5 rounded-xl border border-neutral-200 shadow-xs self-start sm:self-auto">
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

        {/* Responsive Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="w-full sm:w-80">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, category, price..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {selectionMode ? (
              <div className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-xl border border-neutral-300 shadow-sm flex-wrap w-full sm:w-auto">
                <span className="text-xs font-bold text-neutral-800">{selectedIds.length} selected</span>
                <button
                  onClick={handleReleaseConfirm}
                  disabled={selectedIds.length === 0}
                  className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={handleBulkDraft}
                  disabled={selectedIds.length === 0}
                  className="px-2.5 sm:px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Draft
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  className="px-2.5 sm:px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedIds([]);
                  }}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-black cursor-pointer ml-auto"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={openAnnouncementModal}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white shadow-2xs"
                >
                  <Megaphone className="h-4 w-4 text-neutral-700" />
                  <span>Announcement</span>
                </button>
                <button
                  onClick={() => setSelectionMode(true)}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white shadow-2xs"
                >
                  <Package className="h-4 w-4" />
                  <span>Bulk Actions</span>
                </button>
              </>
            )}

            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 bg-black text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Item Count & Pagination summary */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-500">
          <div>
            {filteredProducts.length > 0 ? (
              <span>
                Showing <strong className="text-neutral-800">{startIndex + 1}–{endIndex}</strong> of <strong className="text-neutral-800">{filteredProducts.length}</strong> items (8 per page)
              </span>
            ) : (
              <span>0 items found</span>
            )}
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Updating database...</span>
            </div>
          )}
        </div>

        {/* Desktop Table View (hidden on small mobile screens) */}
        <div className="hidden md:block overflow-x-auto bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500 select-none">
                {selectionMode && <th className="py-3.5 px-4 w-10"></th>}
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Tag Size</th>
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
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                      {selectionMode && (
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => toggleSelectOne(item.id)}
                              className="cursor-pointer flex items-center justify-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-black" />
                              ) : (
                                <Square className="h-4 w-4 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 bg-neutral-100 overflow-hidden rounded-lg">
                          {item.images && item.images[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-900 max-w-xs truncate">{item.title}</td>
                      <td className="py-3 px-4 text-neutral-600 capitalize">{item.collectionSlug}</td>
                      <td className="py-3 px-4 text-neutral-600">{item.tagSize || "N/A"}</td>
                      <td className="py-3 px-4 font-semibold text-neutral-900">{item.priceFormatted}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full uppercase ${item.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-md ${item.isNewArrival ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"
                            }`}
                        >
                          {item.isNewArrival ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-neutral-600 hover:text-black cursor-pointer rounded-lg hover:bg-neutral-100"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                              deleteProduct(item.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 cursor-pointer rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-neutral-500">
                    {loading ? "Loading items from database..." : "No inventory items found. Click 'Add New Item' to create one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Optimized for phones/small screens) */}
        <div className="block md:hidden space-y-3">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    {selectionMode && (
                      <button
                        onClick={() => toggleSelectOne(item.id)}
                        className="cursor-pointer pt-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-black" />
                        ) : (
                          <Square className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    )}
                    <div className="relative w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                      {item.images && item.images[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider capitalize">
                          {item.collectionSlug} • Size {item.tagSize || "N/A"}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${item.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 truncate mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold text-neutral-900 mt-1">
                        {item.priceFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                    <span className="text-neutral-500">
                      New Arrival: {item.isNewArrival ? "Yes" : "No"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.title}"?`)) {
                            deleteProduct(item.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center text-sm text-neutral-500 border border-neutral-200">
              {loading ? "Loading items..." : "No inventory items found."}
            </div>
          )}
        </div>

        {/* Minimal Centered Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-10 gap-3 text-xs font-medium text-neutral-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer transition-opacity flex items-center gap-1"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1.5 bg-neutral-200/70 rounded-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 disabled:opacity-30 cursor-pointer transition-opacity flex items-center gap-1"
              title="Next page"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Announcement Banner Management Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSavingAnnouncement && setIsAnnouncementModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl z-10 overflow-hidden my-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 bg-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-neutral-800" />
                <h2 className="text-base sm:text-lg font-bold text-neutral-950">
                  Announcement Banner
                </h2>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                disabled={isSavingAnnouncement}
                className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Enable Announcement Banner</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Show or hide the black scrolling ticker on the live website.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Announcement Text Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                  Banner Text Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. AUTHENTICATED THRIFT GRAILS & STREETWEAR STATEMENTS • NEW DROPS WEEKLY"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Banner Destination Link */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                  Link / Destination (Optional)
                </label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="e.g. /shop, /new-arrivals, or full URL"
                  className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Live Preview Box with Marquee Ticker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-2">
                  Live Marquee Preview
                </label>
                <div className="w-full bg-black rounded-xl p-3 border border-neutral-800 text-center overflow-hidden shadow-inner">
                  {announcementActive ? (
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
                      {[...Array(20)].map((_, i) => (
                        <span key={i} className="flex items-center gap-6 font-bold tracking-widest uppercase text-white text-xs shrink-0">
                          <span>{announcementText.trim() || "Your announcement text..."}</span>
                          <span className="text-neutral-500">✦</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-neutral-500 text-xs italic">
                      Banner is currently disabled (hidden from website)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Delete Option */}
            <div className="p-4 sm:px-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={isSavingAnnouncement}
                onClick={handleDeleteAnnouncement}
                className="px-3.5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors border border-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Announcement</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingAnnouncement}
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-black rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingAnnouncement}
                  onClick={handleSaveAnnouncement}
                  className="px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-colors shadow-sm"
                >
                  {isSavingAnnouncement ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : announcementSavedSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Announcement</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Item Modal with Tabs: Form & Live 1:1 Storefront Detail Page View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl z-10 overflow-hidden my-4 sm:my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header with Segmented Tab Switcher */}
            <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-950">
                  {editingId ? "Edit Thrift Item" : "Add New Thrift Item"}
                </h2>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-200/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab("edit")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeModalTab === "edit"
                        ? "bg-white text-black shadow-xs"
                        : "text-neutral-600 hover:text-black"
                      }`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Form Fields</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImageIndex(0);
                      setActiveModalTab("preview");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeModalTab === "preview"
                        ? "bg-white text-black shadow-xs"
                        : "text-neutral-600 hover:text-black"
                      }`}
                  >
                    <Eye className="h-3.5 w-3.5 text-neutral-800" />
                    <span>Live Preview</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {activeModalTab === "edit" ? (
              /* FORM TAB */
              <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-6 sm:space-y-8 overflow-y-auto flex-1">

                {/* Basic Information Section */}
                <div className="space-y-4 bg-neutral-50/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Basic Information
                  </h3>

                  {/* Product Title */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                      }}
                      placeholder="e.g. Vintage Shirt"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.title ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                        }`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* Price & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Price (₱) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={priceNum}
                        onChange={(e) => {
                          setPriceNum(e.target.value);
                          if (errors.priceNum) setErrors((prev) => ({ ...prev, priceNum: "" }));
                        }}
                        placeholder="e.g. 250"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.priceNum ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {errors.priceNum && (
                        <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.priceNum}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Collection Category
                      </label>
                      <select
                        value={collectionSlug}
                        onChange={(e) => {
                          setCollectionSlug(e.target.value);
                          if (["bags", "accessories"].includes(e.target.value)) {
                            setTagSize("N/A");
                          }
                        }}
                        className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors capitalize h-[46px]"
                      >
                        <option value="t-shirts">T-Shirts</option>
                        <option value="hoodies">Hoodies</option>
                        <option value="sweaters">Sweaters</option>
                        <option value="jackets">Jackets</option>
                        <option value="shorts">Shorts</option>
                        <option value="pants">Pants</option>
                        <option value="bags">Bags</option>
                        <option value="accessories">Accessories</option>
                        <option value="shoes">Shoes</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="pt-2 flex items-center gap-6 border-t border-neutral-200/60 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer"
                      />
                      <span className="text-sm font-medium text-neutral-800">Mark as New Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSoldOut}
                        onChange={(e) => setIsSoldOut(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer"
                      />
                      <span className="text-sm font-medium text-neutral-800">Sold Out</span>
                    </label>
                  </div>
                </div>

                {/* Thrift Specifications Section */}
                <div className="space-y-4 bg-neutral-50/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Thrift Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tag Size with N/A option */}
                    {!isBagsOrAccessories && (
                      <div>
                        <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                          {isShoes ? "Shoe Size *" : "Tag Size *"}
                        </label>
                        {isShoes ? (
                          <input
                            type="text"
                            value={tagSize}
                            onChange={(e) => {
                              setTagSize(e.target.value);
                              if (errors.tagSize) setErrors((prev) => ({ ...prev, tagSize: "" }));
                            }}
                            placeholder="e.g. US 9 / EU 42 or N/A"
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.tagSize ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                              }`}
                          />
                        ) : (
                          <select
                            value={tagSize}
                            onChange={(e) => {
                              setTagSize(e.target.value);
                              if (errors.tagSize) setErrors((prev) => ({ ...prev, tagSize: "" }));
                            }}
                            className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors h-[46px] ${errors.tagSize ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                              }`}
                          >
                            <option value="N/A">N/A</option>
                            <option value="One Size">One Size</option>
                            <option value="XS">XS (Extra Small)</option>
                            <option value="S">S (Small)</option>
                            <option value="M">M (Medium)</option>
                            <option value="L">L (Large)</option>
                            <option value="XL">XL (Extra Large)</option>
                            <option value="XXL">XXL (Double XL)</option>
                          </select>
                        )}
                        {errors.tagSize && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.tagSize}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Condition Field */}
                    <div className={isBagsOrAccessories ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Condition <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) => {
                          setCondition(e.target.value);
                          if (errors.condition) setErrors((prev) => ({ ...prev, condition: "" }));
                        }}
                        placeholder="e.g. 9/10 No Issue"
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.condition ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {errors.condition && (
                        <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.condition}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Conditional Top/Outerwear Measurements */}
                  {isTopOrOuterwear && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">
                          Length <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lengthVal}
                          onChange={(e) => {
                            setLengthVal(e.target.value);
                            if (errors.lengthVal) setErrors((prev) => ({ ...prev, lengthVal: "" }));
                          }}
                          placeholder="e.g. 25"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.lengthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {errors.lengthVal && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.lengthVal}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">
                          Width <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={widthVal}
                          onChange={(e) => {
                            setWidthVal(e.target.value);
                            if (errors.widthVal) setErrors((prev) => ({ ...prev, widthVal: "" }));
                          }}
                          placeholder="e.g. 33"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.widthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {errors.widthVal && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.widthVal}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conditional Bottoms Measurements */}
                  {isBottoms && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">
                          Waist <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={waistVal}
                          onChange={(e) => {
                            setWaistVal(e.target.value);
                            if (errors.waistVal) setErrors((prev) => ({ ...prev, waistVal: "" }));
                          }}
                          placeholder="e.g. 32"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.waistVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {errors.waistVal && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.waistVal}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">
                          Length <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lengthVal}
                          onChange={(e) => {
                            setLengthVal(e.target.value);
                            if (errors.lengthVal) setErrors((prev) => ({ ...prev, lengthVal: "" }));
                          }}
                          placeholder="e.g. 40"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.lengthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {errors.lengthVal && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.lengthVal}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-800 uppercase mb-1">
                          Leg Opening <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={legOpeningVal}
                          onChange={(e) => {
                            setLegOpeningVal(e.target.value);
                            if (errors.legOpeningVal) setErrors((prev) => ({ ...prev, legOpeningVal: "" }));
                          }}
                          placeholder="e.g. 8"
                          className={`w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.legOpeningVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {errors.legOpeningVal && (
                          <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{errors.legOpeningVal}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conditional Notes for Bags/Accessories/Shoes */}
                  {(isBagsOrAccessories || isShoes) && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Details / Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={notesVal}
                        onChange={(e) => {
                          setNotesVal(e.target.value);
                          if (errors.notesVal) setErrors((prev) => ({ ...prev, notesVal: "" }));
                        }}
                        placeholder={
                          isShoes
                            ? "e.g. Includes original box, minor scuff on left toe..."
                            : "e.g. Adjustable strap, brass hardware, inside pocket..."
                        }
                        className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors resize-y min-h-[90px] ${errors.notesVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {errors.notesVal && (
                        <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.notesVal}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Optional Issue Field for All Categories */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5 flex items-center justify-between">
                      <span>Issue</span>
                      <span className="text-[11px] font-normal text-neutral-400 lowercase">optional</span>
                    </label>
                    <input
                      type="text"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="e.g. Small pinhole on lower hem, minor fading, none"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-black rounded-xl text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Product Photos Section */}
                <div className="space-y-4 bg-neutral-50/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Product Photos <span className="text-red-500">*</span>
                    </h3>
                    <span className="text-xs text-neutral-500 font-medium">{images.length} / 9 photos</span>
                  </div>

                  {/* Inline Upload Alert Error */}
                  {uploadError && (
                    <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Upload Button Box */}
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 sm:p-6 cursor-pointer transition-colors bg-white ${errors.images ? "border-red-400 bg-red-50/10" : "border-neutral-300 hover:border-black"
                    }`}>
                    {uploadingCount > 0 ? (
                      <div className="flex flex-col items-center gap-2 text-neutral-600">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-900" />
                        <span className="text-sm font-medium">Uploading {uploadingCount} photo(s)...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-neutral-500 mb-2" />
                        <span className="text-sm font-medium text-neutral-900">Click to upload photos</span>
                        <span className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP up to 10MB each (max 9 photos)</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingCount > 0 || images.length >= 9}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {errors.images && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.images}</span>
                    </p>
                  )}

                  {/* Photos Grid with Drag and Drop Reordering */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={() => handleDragStart(i)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(i)}
                          className="relative bg-white rounded-xl overflow-hidden border border-neutral-300 p-2 shadow-xs flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-black transition-all"
                        >
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-100">
                            <Image src={img} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" />

                            {/* Drag handle indicator */}
                            <div className="absolute top-1 left-1 bg-black/70 text-white p-1 rounded backdrop-blur-xs flex items-center gap-1">
                              <GripVertical className="h-3 w-3" />
                              {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wider pr-1">Main</span>}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(i);
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-colors z-10"
                              title="Remove photo"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* LIVE STOREFRONT DETAIL PAGE PREVIEW TAB (1:1 Exact Match with Live Customer View) */
              <div className="px-5 sm:px-8 py-6 space-y-6 overflow-y-auto flex-1 bg-white font-helvetica">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">

                  {/* Left Section: Vertical Thumbnails + Main Image Viewer */}
                  <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
                    {/* Vertical Thumbnail List on the Left */}
                    <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[35rem] shrink-0">
                      {(images.length > 0 ? images : ["/brand-image.jpg"]).map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewImageIndex(idx)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 overflow-hidden rounded-none border-2 transition-all cursor-pointer ${previewImageIndex === idx ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Main Active Photo Viewer */}
                    <div className="relative flex-1 aspect-square sm:h-[35rem] bg-neutral-100 overflow-hidden rounded-none">
                      {images.length > 0 ? (
                        <Image
                          src={images[previewImageIndex] || images[0]}
                          alt={title || "Product Preview"}
                          fill
                          unoptimized
                          className="object-cover object-center transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs p-6 text-center">
                          <Upload className="h-8 w-8 mb-2 opacity-40 text-neutral-500" />
                          <span>No photos uploaded yet. Upload in Form tab to view here.</span>
                        </div>
                      )}

                      {/* Circular Prev/Next Navigation Arrows */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                            aria-label="Previous image"
                            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="h-5 w-5 stroke-2" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewImageIndex((prev) => (prev + 1) % images.length)}
                            aria-label="Next image"
                            className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5 stroke-2" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Title, Price, Copy Order Button, Specs, How to Order Box */}
                  <div className="lg:col-span-5 space-y-6 pt-2">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-tight">
                        {title.trim() ? title.trim() : "—"}
                      </h1>
                      <p className="text-base sm:text-lg font-medium text-neutral-900 mt-2">
                        {priceNum.trim() ? livePriceFormatted : "₱0.00"}
                      </p>
                    </div>

                    {/* Copy Order Details Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== "undefined" ? window.location.origin : "";
                          const productLink = editingId ? `${origin}/products/${editingId}` : `${origin}/products/...`;
                          const issueText = issue.trim();

                          const orderText = `ORDER INQUIRY - GRAIL SOCIETY\n` +
                            `• Item: ${title.trim() || "Untitled"}\n` +
                            `• Price: ${livePriceFormatted}\n` +
                            `• Tag Size: ${tagSize || "N/A"}\n` +
                            `• Measurements: ${liveFormattedMeasurements}\n` +
                            `• Condition: ${condition.trim() || "N/A"}\n` +
                            (issueText ? `• Issue: ${issueText}\n\n` : `\n`) +
                            `Product Link: ${productLink}\n\n` +
                            `Image Link: ${images[0] || "No image uploaded"}`;

                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(orderText);
                          }
                          setCopiedPreview(true);
                          setTimeout(() => setCopiedPreview(false), 2500);
                        }}
                        className="w-full flex items-center justify-center gap-2.5 py-4 bg-black text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-sm"
                      >
                        {copiedPreview ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                            <span>Copied Order Details!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 stroke-2" />
                            <span>Copy Order Details</span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-neutral-500 text-center mt-2">
                        Click to copy order details. Paste directly into our Facebook chat!
                      </p>
                    </div>

                    {/* Expanded Thrift Specifications List (Exact Match with Live Storefront) */}
                    <div className="space-y-2 text-xs sm:text-sm text-neutral-700 font-normal pt-2 border-t border-neutral-100">
                      <p>
                        <span className="font-semibold text-neutral-900">Tag Size:</span> {tagSize || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-900">Measurements:</span> {liveFormattedMeasurements}
                      </p>
                      <p>
                        <span className="font-semibold text-neutral-900">Condition:</span> {condition.trim() || "—"}
                      </p>
                      {issue.trim() && (
                        <p>
                          <span className="font-semibold text-neutral-900">Issue:</span> {issue.trim()}
                        </p>
                      )}
                    </div>

                    {/* Highlighted How To Order Block (Exact Match with Live Storefront) */}
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-lg space-y-3">
                      <div className="font-bold text-xs tracking-wider uppercase text-black flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 stroke-[2]" />
                        <span>HOW TO ORDER</span>
                      </div>

                      <ol className="space-y-2 text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Click <b>Copy Order Details</b> above.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>
                            Paste it into our Facebook page chat:{" "}
                            <a
                              href="https://www.facebook.com/people/Grail-Society/100075987014852/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold underline text-black hover:text-neutral-600"
                            >
                              Grail Society
                            </a>
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>Our team will assist you with checkout.</span>
                        </li>
                      </ol>

                      <div className="pt-2 border-t border-neutral-200/60 text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5 text-neutral-800" />
                        <span>Bonus: FREE shipping on every item!</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Modal Sticky Footer */}
            <div className="p-4 sm:px-8 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={isSaving || uploadingCount > 0}
                onClick={() => handleSave("draft")}
                className="w-full sm:w-1/2 py-3 sm:py-3.5 bg-neutral-200 text-neutral-900 text-sm font-medium rounded-xl hover:bg-neutral-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Save as Draft</span>
              </button>
              <button
                type="button"
                disabled={isSaving || uploadingCount > 0}
                onClick={() => handleSave("published")}
                className="w-full sm:w-1/2 py-3 sm:py-3.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-neutral-800 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Publish Live</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}