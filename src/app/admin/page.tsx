"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProducts, Product } from "@/context/ProductContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { getCategoryLabel } from "@/lib/categories";
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
  MinusSquare,
  Filter,
  FilterX,
  Package,
  ExternalLink,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Loader2,
  RefreshCw,
  AlertCircle,
  Megaphone,
  Check,
  Eye,
  EyeOff,
  ShoppingBag,
  Copy,
  Gift,
  Star,
  ArrowLeft,
  ArrowRight,
  Hash,
  ListOrdered,
  LayoutGrid,
  Grid3X3,
  Users,
  UserPlus,
  Shield,
  Key,
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
    reorderProducts,
    refreshProducts,
  } = useProducts();
  const {
    currentUser,
    isAuthenticated,
    isAuthLoaded,
    adminUsers,
    logout,
    createAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    refreshAdminUsers,
  } = useAdminAuth();
  const { announcement, updateAnnouncement, deleteAnnouncement } = useAnnouncement();
  const router = useRouter();

  // Auth Protection Effect
  useEffect(() => {
    if (isAuthLoaded && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthLoaded, isAuthenticated, router]);

  // Team / Admin Accounts Management Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminModalTab, setAdminModalTab] = useState<"list" | "create" | "edit">("list");
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [adminFormUsername, setAdminFormUsername] = useState("");
  const [adminFormFullName, setAdminFormFullName] = useState("");
  const [adminFormEmail, setAdminFormEmail] = useState("");
  const [adminFormRole, setAdminFormRole] = useState<"owner" | "admin">("admin");
  const [adminFormPassword, setAdminFormPassword] = useState("");
  const [adminFormActive, setAdminFormActive] = useState(true);
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminFormSuccess, setAdminFormSuccess] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [newArrivalFilter, setNewArrivalFilter] = useState<"all" | "yes" | "no">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 items per page before advancing to page 2

  // Helper functions for garment measurement units (inches)
  const stripInch = (val?: string) => {
    if (!val) return "";
    return val.replace(/["'\s]|in$/gi, "").trim();
  };

  const formatInch = (val?: string) => {
    if (!val) return "";
    const cleaned = stripInch(val);
    return cleaned ? `${cleaned}"` : "";
  };

  const sanitizeMeasurementInput = (val: string) => {
    // Keep only numbers and at most one decimal point
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

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

  const [condition, setCondition] = useState("Excellent");
  const [issue, setIssue] = useState("");
  const [modelHeight, setModelHeight] = useState("");
  const [modelWeight, setModelWeight] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);

  // Drag and drop & layout state for images
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [photoGridDensity, setPhotoGridDensity] = useState<"compact" | "comfortable">("compact");

  // Reorder Modal states (Hook placed at top to follow Rules of Hooks)
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderList, setReorderList] = useState<Product[]>([]);
  const [reorderSearch, setReorderSearch] = useState("");
  const [draggedReorderIdx, setDraggedReorderIdx] = useState<number | null>(null);
  const [dragOverReorderIdx, setDragOverReorderIdx] = useState<number | null>(null);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [reorderSavedSuccess, setReorderSavedSuccess] = useState(false);
  const [jumpToPosId, setJumpToPosId] = useState<string | null>(null);
  const [jumpToPosValue, setJumpToPosValue] = useState<string>("");
  const reorderContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view in Live Preview tab
  useEffect(() => {
    if (activeModalTab === "preview") {
      const thumb = document.getElementById(`admin-preview-thumb-${previewImageIndex}`);
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
  }, [previewImageIndex, activeModalTab]);

  // Auth Protection Return
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
    setCondition("Excellent");
    setIssue("");
    setModelHeight("");
    setModelWeight("");
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
    setLengthVal(stripInch(item.measurementsData?.length));
    setWidthVal(stripInch(item.measurementsData?.width));
    setWaistVal(stripInch(item.measurementsData?.waist));
    setLegOpeningVal(stripInch(item.measurementsData?.legOpening));
    setNotesVal(item.measurementsData?.notes || "");
    const itemCond = item.condition?.trim() || "";
    if (itemCond.toLowerCase() === "excellent") {
      setCondition("Excellent");
    } else if (itemCond.toLowerCase() === "good") {
      setCondition("Good");
    } else {
      setCondition(itemCond || "Excellent");
    }
    setIssue(item.issue || item.measurementsData?.issue || "");
    setModelHeight(item.modelHeight || item.measurementsData?.modelHeight || "");
    setModelWeight(item.modelWeight || item.measurementsData?.modelWeight || "");
    setImages(item.images || []);
    setIsNewArrival(!!item.isNewArrival);
    setIsSoldOut(!!item.isSoldOut);
    setUploadError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openReorderModal = () => {
    setReorderList([...products]);
    setReorderSearch("");
    setReorderSavedSuccess(false);
    setDraggedReorderIdx(null);
    setDragOverReorderIdx(null);
    setJumpToPosId(null);
    setJumpToPosValue("");
    setIsReorderModalOpen(true);
  };

  const moveReorderItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reorderList.length) return;
    const copy = [...reorderList];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setReorderList(copy);
  };

  const handleReorderDragStart = (e: React.DragEvent, index: number) => {
    setDraggedReorderIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverReorderIdx !== index) {
      setDragOverReorderIdx(index);
    }
    // Auto-scroll when dragging near top or bottom edge of list
    if (reorderContainerRef.current) {
      const rect = reorderContainerRef.current.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const scrollThreshold = 55;
      if (offsetY < scrollThreshold) {
        reorderContainerRef.current.scrollTop -= 10;
      } else if (rect.bottom - e.clientY < scrollThreshold) {
        reorderContainerRef.current.scrollTop += 10;
      }
    }
  };

  const handleReorderDrop = (dropIndex: number) => {
    setDragOverReorderIdx(null);
    if (draggedReorderIdx === null || draggedReorderIdx === dropIndex) {
      setDraggedReorderIdx(null);
      return;
    }

    const updated = [...reorderList];
    const [moved] = updated.splice(draggedReorderIdx, 1);
    updated.splice(dropIndex, 0, moved);

    setReorderList(updated);
    setDraggedReorderIdx(null);
  };

  const handleMoveToTop = (itemId: string) => {
    const currentIdx = reorderList.findIndex((p) => p.id === itemId);
    if (currentIdx <= 0) return;
    const updated = [...reorderList];
    const [moved] = updated.splice(currentIdx, 1);
    updated.unshift(moved);
    setReorderList(updated);
    setJumpToPosId(null);
  };

  const handleMoveToBottom = (itemId: string) => {
    const currentIdx = reorderList.findIndex((p) => p.id === itemId);
    if (currentIdx < 0 || currentIdx === reorderList.length - 1) return;
    const updated = [...reorderList];
    const [moved] = updated.splice(currentIdx, 1);
    updated.push(moved);
    setReorderList(updated);
    setJumpToPosId(null);
  };

  const handleMoveToPosition = (itemId: string, targetPos1Indexed: number) => {
    const currentIdx = reorderList.findIndex((p) => p.id === itemId);
    if (currentIdx < 0) return;
    if (isNaN(targetPos1Indexed) || targetPos1Indexed < 1) return;

    const clamped = Math.max(1, Math.min(reorderList.length, Math.floor(targetPos1Indexed)));
    const targetIdx = clamped - 1;
    if (targetIdx === currentIdx) {
      setJumpToPosId(null);
      return;
    }

    const updated = [...reorderList];
    const [moved] = updated.splice(currentIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setReorderList(updated);
    setJumpToPosId(null);
    setJumpToPosValue("");
  };

  const handleSaveReorder = async () => {
    setIsSavingReorder(true);
    try {
      const orderedIds = reorderList.map((p) => p.id);
      await reorderProducts(orderedIds);
      setReorderSavedSuccess(true);
      setTimeout(() => {
        setIsReorderModalOpen(false);
        setReorderSavedSuccess(false);
      }, 900);
    } catch (err) {
      console.error("Failed to save product order:", err);
    } finally {
      setIsSavingReorder(false);
    }
  };

  // Team Admin Account Handlers
  const openCreateAdmin = () => {
    setAdminFormUsername("");
    setAdminFormFullName("");
    setAdminFormEmail("");
    setAdminFormRole("admin");
    setAdminFormPassword("");
    setAdminFormActive(true);
    setAdminFormError(null);
    setAdminFormSuccess(null);
    setShowAdminPassword(false);
    setAdminModalTab("create");
  };

  const openEditAdmin = (admin: any) => {
    setSelectedAdminId(admin.id);
    setAdminFormUsername(admin.username);
    setAdminFormFullName(admin.fullName);
    setAdminFormEmail(admin.email || "");
    setAdminFormRole(admin.role === "owner" ? "owner" : "admin");
    setAdminFormPassword("");
    setAdminFormActive(admin.isActive !== false);
    setAdminFormError(null);
    setAdminFormSuccess(null);
    setShowAdminPassword(false);
    setAdminModalTab("edit");
  };

  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);
    setAdminFormSuccess(null);
    setIsAdminSubmitting(true);

    try {
      if (adminModalTab === "create") {
        const res = await createAdminAccount({
          username: adminFormUsername,
          fullName: adminFormFullName,
          email: adminFormEmail || undefined,
          role: adminFormRole,
          password: adminFormPassword,
        });

        if (res.success) {
          setAdminFormSuccess("Admin account created successfully!");
          setTimeout(() => {
            setAdminModalTab("list");
            setAdminFormSuccess(null);
          }, 900);
        } else {
          setAdminFormError(res.error || "Failed to create admin account.");
        }
      } else if (adminModalTab === "edit" && selectedAdminId) {
        const res = await updateAdminAccount(selectedAdminId, {
          username: adminFormUsername,
          fullName: adminFormFullName,
          email: adminFormEmail || undefined,
          role: adminFormRole,
          isActive: adminFormActive,
          password: adminFormPassword.trim() ? adminFormPassword.trim() : undefined,
        });

        if (res.success) {
          setAdminFormSuccess("Admin account updated successfully!");
          setTimeout(() => {
            setAdminModalTab("list");
            setAdminFormSuccess(null);
          }, 900);
        } else {
          setAdminFormError(res.error || "Failed to update admin account.");
        }
      }
    } catch (err: any) {
      setAdminFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: any) => {
    if (currentUser?.id === admin.id) {
      alert("You cannot delete your own active admin account.");
      return;
    }
    if (confirm(`Are you sure you want to delete admin account "${admin.fullName}" (@${admin.username})?`)) {
      const res = await deleteAdminAccount(admin.id);
      if (!res.success) {
        alert(res.error || "Failed to delete admin account.");
      }
    }
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

    if (images.length >= 20) {
      setUploadError("Maximum 20 images allowed per product. Please delete an image first.");
      e.target.value = "";
      return;
    }

    const remainingSlots = 20 - images.length;
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
      setImages((prev) => [...prev, ...uploadedUrls.filter(Boolean)].slice(0, 20));
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

  const moveImageToFirst = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      copy.unshift(target);
      return copy;
    });
    setPreviewImageIndex(0);
  };

  const moveImageStep = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Image Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    setDragOverIndex(null);
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const updatedImages = [...images];
    const [draggedItem] = updatedImages.splice(draggedImageIndex, 1);
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
        measurementsData = { waist: formatInch(waistVal), length: formatInch(lengthVal), legOpening: formatInch(legOpeningVal) };
      } else {
        measurementsData = { length: formatInch(lengthVal), width: formatInch(widthVal) };
      }

      if (issue.trim()) {
        measurementsData.issue = issue.trim();
      }
      if (modelHeight.trim()) {
        measurementsData.modelHeight = modelHeight.trim();
      }
      if (modelWeight.trim()) {
        measurementsData.modelWeight = modelWeight.trim();
      }

      const finalTagSize = ["bags", "accessories"].includes(collectionSlug) ? "N/A" : tagSize;
      const existingDisplayOrder = editingId
        ? products.find((p) => p.id === editingId)?.displayOrder ?? 0
        : 0;

      const payload = {
        title: title.trim(),
        priceNum: num,
        priceFormatted,
        collectionSlug,
        tagSize: finalTagSize,
        measurementsData,
        condition: condition.trim(),
        issue: issue.trim() || undefined,
        modelHeight: modelHeight.trim() || undefined,
        modelWeight: modelWeight.trim() || undefined,
        images,
        isNewArrival,
        status: targetStatus,
        isSoldOut,
        displayOrder: existingDisplayOrder,
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

  // Search & Filter Logic
  const filteredProducts = products.filter((item) => {
    // 1. Search Query filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesCollection = (item.collectionSlug || "").toLowerCase().includes(q);
      const matchesPrice =
        (item.priceFormatted || "").toLowerCase().includes(q) || item.priceNum.toString().includes(q);
      if (!matchesTitle && !matchesCollection && !matchesPrice) return false;
    }

    // 2. Category filter
    if (categoryFilter !== "all") {
      if ((item.collectionSlug || "").toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    // 3. Status filter
    if (statusFilter !== "all") {
      if (item.status !== statusFilter) {
        return false;
      }
    }

    // 4. New Arrival filter
    if (newArrivalFilter !== "all") {
      if (newArrivalFilter === "yes" && !item.isNewArrival) return false;
      if (newArrivalFilter === "no" && item.isNewArrival) return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchQuery !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    newArrivalFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setNewArrivalFilter("all");
    setCurrentPage(1);
  };

  // Select All computed state & handlers
  const allFilteredIds = filteredProducts.map((p) => p.id);
  const isAllSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  // Pagination Logic (10 items per page)
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
      lengthVal.trim() ? `Length: ${formatInch(lengthVal)}` : "",
      widthVal.trim() ? `Width: ${formatInch(widthVal)}` : "",
      waistVal.trim() ? `Waist: ${formatInch(waistVal)}` : "",
      legOpeningVal.trim() ? `Leg Opening: ${formatInch(legOpeningVal)}` : "",
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
            {/* Logged in User Profile Info */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-neutral-800/90 border border-neutral-700/80 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shrink-0 uppercase shadow-xs">
                {(currentUser?.fullName || currentUser?.username || "A").charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px]">
                  {currentUser?.fullName || currentUser?.username || "Admin"}
                </span>
                <span className="text-[9px] uppercase font-bold text-amber-400">
                  {currentUser?.role === "owner" ? "Owner" : "Admin"}
                </span>
              </div>
            </div>

            {/* Team Accounts Button */}
            <button
              onClick={() => {
                refreshAdminUsers();
                setAdminModalTab("list");
                setIsAdminModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200 hover:text-white transition-colors bg-neutral-800 hover:bg-neutral-700 px-2.5 sm:px-3.5 py-2 rounded-xl border border-neutral-700/60 cursor-pointer"
              title="Manage Admin Team Accounts"
            >
              <Users className="h-3.5 w-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Team Accounts</span>
            </button>

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

        {/* Responsive Action & Filter Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6">
          {/* Row 1: Search Bar on Left (max-w-[620px]), Action Buttons on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full lg:max-w-[620px]">
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
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-2xl text-xs sm:text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Action Buttons (Announcement, Bulk Actions, Add New Item) */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar">
              {selectionMode ? (
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-1.5 px-2.5 sm:px-3 rounded-2xl border border-neutral-300 shadow-2xs whitespace-nowrap shrink-0">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    title={isAllSelected ? "Deselect all filtered items" : `Select all ${filteredProducts.length} items`}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 text-black" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="h-3.5 w-3.5 text-neutral-700" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-neutral-500" />
                    )}
                    <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
                  </button>

                  <span className="text-xs font-bold text-neutral-700 whitespace-nowrap px-0.5 shrink-0">
                    {selectedIds.length} selected
                  </span>

                  <span className="h-4 w-px bg-neutral-200 shrink-0 mx-0.5" />

                  <button
                    onClick={handleReleaseConfirm}
                    disabled={selectedIds.length === 0}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-40 cursor-pointer transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    Publish
                  </button>
                  <button
                    onClick={handleBulkDraft}
                    disabled={selectedIds.length === 0}
                    className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 disabled:opacity-40 cursor-pointer transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    Draft
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 cursor-pointer transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    Delete
                  </button>

                  <span className="h-4 w-px bg-neutral-200 shrink-0 mx-0.5" />

                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedIds([]);
                    }}
                    className="px-2 py-1 text-xs text-neutral-500 hover:text-black cursor-pointer font-bold whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={openAnnouncementModal}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-bold rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white shadow-2xs whitespace-nowrap shrink-0"
                  >
                    <Megaphone className="h-4 w-4 text-neutral-800 shrink-0" />
                    <span>Announcement</span>
                  </button>
                  <button
                    onClick={openReorderModal}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-bold rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white shadow-2xs whitespace-nowrap shrink-0"
                    title="Manage storefront display order"
                  >
                    <ListOrdered className="h-4 w-4 text-neutral-800 shrink-0" />
                    <span>Arrange Order</span>
                  </button>
                  <button
                    onClick={() => setSelectionMode(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-bold rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer bg-white shadow-2xs whitespace-nowrap shrink-0"
                  >
                    <Package className="h-4 w-4 text-neutral-800 shrink-0" />
                    <span>Bulk Actions</span>
                  </button>
                </>
              )}

              <button
                onClick={openAddModal}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-black text-white text-xs sm:text-sm font-bold rounded-2xl hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span>Add New Item</span>
              </button>
            </div>
          </div>

          {/* Row 2: 3 Filter Buttons (All in ONE Row on Mobile & Desktop) & Clear Filters Button (Aligned on Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            {/* Left: 3 Filter Buttons in One Row (matching search bar max width on desktop) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full lg:max-w-[620px]">
              {/* Category Filter Button */}
              <div className="relative w-full min-w-0">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 border text-[11px] sm:text-xs md:text-sm font-bold rounded-xl sm:rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs appearance-none pr-6 sm:pr-8 md:pr-9 capitalize truncate ${
                    categoryFilter !== "all"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                >
                  <option value="all" className="bg-white text-neutral-900 font-normal">All Categories</option>
                  <option value="t-shirts" className="bg-white text-neutral-900 font-normal">T-shirts and Polos</option>
                  <option value="hoodies" className="bg-white text-neutral-900 font-normal">Hoodies</option>
                  <option value="sweaters" className="bg-white text-neutral-900 font-normal">Sweaters and Long Sleeves</option>
                  <option value="jackets" className="bg-white text-neutral-900 font-normal">Jackets</option>
                  <option value="shorts" className="bg-white text-neutral-900 font-normal">Shorts</option>
                  <option value="pants" className="bg-white text-neutral-900 font-normal">Pants</option>
                  <option value="bags" className="bg-white text-neutral-900 font-normal">Bags</option>
                  <option value="accessories" className="bg-white text-neutral-900 font-normal">Accessories</option>
                  <option value="shoes" className="bg-white text-neutral-900 font-normal">Shoes</option>
                </select>
                <ChevronDown className={`absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none ${
                  categoryFilter !== "all" ? "text-white" : "text-neutral-500"
                }`} />
              </div>

              {/* Status Filter Button */}
              <div className="relative w-full min-w-0">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "all" | "published" | "draft");
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 border text-[11px] sm:text-xs md:text-sm font-bold rounded-xl sm:rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs appearance-none pr-6 sm:pr-8 md:pr-9 capitalize truncate ${
                    statusFilter !== "all"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                >
                  <option value="all" className="bg-white text-neutral-900 font-normal">All Statuses</option>
                  <option value="published" className="bg-white text-neutral-900 font-normal">Published</option>
                  <option value="draft" className="bg-white text-neutral-900 font-normal">Draft</option>
                </select>
                <ChevronDown className={`absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none ${
                  statusFilter !== "all" ? "text-white" : "text-neutral-500"
                }`} />
              </div>

              {/* New Arrival Filter Button */}
              <div className="relative w-full min-w-0">
                <select
                  value={newArrivalFilter}
                  onChange={(e) => {
                    setNewArrivalFilter(e.target.value as "all" | "yes" | "no");
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2 sm:px-3.5 md:px-4 py-2 sm:py-2.5 md:py-3 border text-[11px] sm:text-xs md:text-sm font-bold rounded-xl sm:rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs appearance-none pr-6 sm:pr-8 md:pr-9 truncate ${
                    newArrivalFilter !== "all"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white border-neutral-300 text-neutral-900"
                  }`}
                >
                  <option value="all" className="bg-white text-neutral-900 font-normal">All New Arrivals</option>
                  <option value="yes" className="bg-white text-neutral-900 font-normal">New Arrivals Only</option>
                  <option value="no" className="bg-white text-neutral-900 font-normal">Not New Arrival</option>
                </select>
                <ChevronDown className={`absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 pointer-events-none ${
                  newArrivalFilter !== "all" ? "text-white" : "text-neutral-500"
                }`} />
              </div>
            </div>

            {/* Right: Clear Filters Button placed below Add New Item on the same horizontal level */}
            {hasActiveFilters && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  title="Clear all active filters"
                >
                  <FilterX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                  <span>Clear filters</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Item Count & Pagination summary */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-neutral-500">
          <div>
            {filteredProducts.length > 0 ? (
              <span>
                Showing <strong className="text-neutral-800">{startIndex + 1}–{endIndex}</strong> of <strong className="text-neutral-800">{filteredProducts.length}</strong> items (10 per page)
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
                {selectionMode && (
                  <th className="py-3.5 px-4 w-10">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="cursor-pointer flex items-center justify-center text-neutral-600 hover:text-black transition-colors"
                        title={isAllSelected ? "Deselect all items" : "Select all items"}
                      >
                        {isAllSelected ? (
                          <CheckSquare className="h-4 w-4 text-black" />
                        ) : isSomeSelected ? (
                          <MinusSquare className="h-4 w-4 text-neutral-700" />
                        ) : (
                          <Square className="h-4 w-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </th>
                )}
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
                        <div className="relative w-12 h-12 bg-white border border-neutral-200/80 overflow-hidden rounded-lg">
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
                      <td className="py-3 px-4 text-neutral-600 capitalize">{getCategoryLabel(item.collectionSlug)}</td>
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
                    <div className="relative w-16 h-16 bg-white border border-neutral-200/80 rounded-xl overflow-hidden shrink-0">
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
                          {getCategoryLabel(item.collectionSlug)} • Size {item.tagSize || "N/A"}
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
                    <span className="text-neutral-500 text-[11px]">
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
                      tabIndex={1}
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
                        tabIndex={2}
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
                        tabIndex={3}
                        value={collectionSlug}
                        onChange={(e) => {
                          setCollectionSlug(e.target.value);
                          if (["bags", "accessories"].includes(e.target.value)) {
                            setTagSize("N/A");
                          }
                        }}
                        className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors capitalize h-[46px]"
                      >
                        <option value="t-shirts">T-shirts and Polos</option>
                        <option value="hoodies">Hoodies</option>
                        <option value="sweaters">Sweaters and Long Sleeves</option>
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
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        tabIndex={4}
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setIsNewArrival((prev) => !prev);
                          }
                        }}
                        className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
                      />
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-black">Mark as New Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        tabIndex={5}
                        checked={isSoldOut}
                        onChange={(e) => setIsSoldOut(e.target.checked)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setIsSoldOut((prev) => !prev);
                          }
                        }}
                        className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 outline-none"
                      />
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-black">Sold Out</span>
                    </label>
                  </div>
                </div>

                {/* Thrift Specifications Section */}
                <div className="space-y-4 bg-neutral-50/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Thrift Specifications
                  </h3>

                  {/* 1. Tag Size */}
                  {!isBagsOrAccessories && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        {isShoes ? "Shoe Size *" : "Tag Size *"}
                      </label>
                      {isShoes ? (
                        <input
                          type="text"
                          tabIndex={6}
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
                          tabIndex={6}
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

                  {/* 2. Measurements Section */}
                  <div className="space-y-2 pt-1 border-t border-neutral-200/60">
                    <label className="block text-xs font-semibold text-neutral-800 uppercase">
                      Measurements
                    </label>

                    {/* Conditional Top/Outerwear Measurements */}
                    {isTopOrOuterwear && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                            Length <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              tabIndex={7}
                              value={lengthVal}
                              onChange={(e) => {
                                const clean = sanitizeMeasurementInput(e.target.value);
                                setLengthVal(clean);
                                if (errors.lengthVal) setErrors((prev) => ({ ...prev, lengthVal: "" }));
                              }}
                              placeholder="e.g. 25"
                              className={`w-full pl-3 pr-8 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.lengthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none select-none">
                              &quot;
                            </span>
                          </div>
                          {errors.lengthVal && (
                            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>{errors.lengthVal}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                            Width <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              tabIndex={8}
                              value={widthVal}
                              onChange={(e) => {
                                const clean = sanitizeMeasurementInput(e.target.value);
                                setWidthVal(clean);
                                if (errors.widthVal) setErrors((prev) => ({ ...prev, widthVal: "" }));
                              }}
                              placeholder="e.g. 22"
                              className={`w-full pl-3 pr-8 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.widthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none select-none">
                              &quot;
                            </span>
                          </div>
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
                          <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                            Waist <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              tabIndex={7}
                              value={waistVal}
                              onChange={(e) => {
                                const clean = sanitizeMeasurementInput(e.target.value);
                                setWaistVal(clean);
                                if (errors.waistVal) setErrors((prev) => ({ ...prev, waistVal: "" }));
                              }}
                              placeholder="e.g. 32"
                              className={`w-full pl-3 pr-8 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.waistVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none select-none">
                              &quot;
                            </span>
                          </div>
                          {errors.waistVal && (
                            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>{errors.waistVal}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                            Length <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              tabIndex={8}
                              value={lengthVal}
                              onChange={(e) => {
                                const clean = sanitizeMeasurementInput(e.target.value);
                                setLengthVal(clean);
                                if (errors.lengthVal) setErrors((prev) => ({ ...prev, lengthVal: "" }));
                              }}
                              placeholder="e.g. 40"
                              className={`w-full pl-3 pr-8 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.lengthVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none select-none">
                              &quot;
                            </span>
                          </div>
                          {errors.lengthVal && (
                            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>{errors.lengthVal}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                            Leg Opening <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              tabIndex={9}
                              value={legOpeningVal}
                              onChange={(e) => {
                                const clean = sanitizeMeasurementInput(e.target.value);
                                setLegOpeningVal(clean);
                                if (errors.legOpeningVal) setErrors((prev) => ({ ...prev, legOpeningVal: "" }));
                              }}
                              placeholder="e.g. 8"
                              className={`w-full pl-3 pr-8 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-colors ${errors.legOpeningVal ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none select-none">
                              &quot;
                            </span>
                          </div>
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
                        <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                          Details / Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          tabIndex={7}
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
                  </div>

                  {/* 3. Condition Field */}
                  <div className="pt-1 border-t border-neutral-200/60">
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      tabIndex={10}
                      value={condition}
                      onChange={(e) => {
                        setCondition(e.target.value);
                        if (errors.condition) setErrors((prev) => ({ ...prev, condition: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none transition-colors h-[46px] ${errors.condition ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-neutral-300 focus:border-black"
                        }`}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      {condition && !["Excellent", "Good"].includes(condition) && (
                        <option value={condition}>{condition}</option>
                      )}
                    </select>
                    {errors.condition && (
                      <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.condition}</span>
                      </p>
                    )}
                  </div>

                  {/* 4. Issue Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5 flex items-center justify-between">
                      <span>Issue</span>
                      <span className="text-[11px] font-normal text-neutral-400 lowercase">optional</span>
                    </label>
                    <input
                      type="text"
                      tabIndex={11}
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="e.g. Small pinhole on lower hem, minor fading, none"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-black rounded-xl text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* 5. Model Details (Height & Weight) */}
                  <div className="pt-2 border-t border-neutral-200/60">
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-2 flex items-center justify-between">
                      <span>Model Details</span>
                      <span className="text-[11px] font-normal text-neutral-400 lowercase">optional</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                          Height (feet)
                        </label>
                        <input
                          type="text"
                          tabIndex={12}
                          value={modelHeight}
                          onChange={(e) => setModelHeight(e.target.value)}
                          placeholder="e.g. 5'8 or 5.8"
                          className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-sm focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          tabIndex={13}
                          value={modelWeight}
                          onChange={(e) => setModelWeight(e.target.value)}
                          placeholder="e.g. 70"
                          className="w-full px-4 py-2.5 bg-white border border-neutral-300 focus:border-black rounded-xl text-sm focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Photos Section */}
                <div className="space-y-4 bg-neutral-50/60 p-4 sm:p-5 rounded-2xl border border-neutral-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <span>Product Photos</span>
                        <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Drag photos or use the quick buttons below to organize. Photo #1 is the primary cover.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs font-semibold text-neutral-700 bg-neutral-200/80 px-2.5 py-1 rounded-lg">
                        {images.length} / 20 photos
                      </span>

                      {/* Grid Density Toggle */}
                      {images.length > 0 && (
                        <div className="flex items-center bg-neutral-200/80 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setPhotoGridDensity("compact")}
                            title="Compact View (5 columns)"
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              photoGridDensity === "compact"
                                ? "bg-white text-black shadow-xs"
                                : "text-neutral-500 hover:text-black"
                            }`}
                          >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline text-[11px]">Compact</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoGridDensity("comfortable")}
                            title="Comfortable View (3 columns)"
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              photoGridDensity === "comfortable"
                                ? "bg-white text-black shadow-xs"
                                : "text-neutral-500 hover:text-black"
                            }`}
                          >
                            <Grid3X3 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline text-[11px]">Large</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Upload Alert Error */}
                  {uploadError && (
                    <div className="p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Upload Button Box */}
                  {images.length < 20 && (
                    <label
                      tabIndex={12}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const fileInput = document.getElementById("admin-file-upload") as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }
                      }}
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl ${
                        images.length > 0 ? "p-3.5 sm:p-4" : "p-5 sm:p-6"
                      } cursor-pointer transition-colors bg-white focus-visible:ring-2 focus-visible:ring-black outline-none ${
                        errors.images ? "border-red-400 bg-red-50/10" : "border-neutral-300 hover:border-black"
                      }`}
                    >
                      {uploadingCount > 0 ? (
                        <div className="flex flex-col items-center gap-2 text-neutral-600">
                          <Loader2 className="h-5 w-5 animate-spin text-neutral-900" />
                          <span className="text-xs sm:text-sm font-medium">Uploading {uploadingCount} photo(s)...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-neutral-500 mb-1" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-900">
                            {images.length === 0 ? "Click to upload photos" : "Add more photos"}
                          </span>
                          <span className="text-[11px] text-neutral-400 mt-0.5">
                            PNG, JPG, WEBP up to 10MB ({20 - images.length} slots remaining)
                          </span>
                        </>
                      )}
                      <input
                        id="admin-file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingCount > 0 || images.length >= 20}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {errors.images && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.images}</span>
                    </p>
                  )}

                  {/* Photos Grid with Drag and Drop Reordering and Quick Action Bar */}
                  {images.length > 0 && (
                    <div
                      className={
                        photoGridDensity === "compact"
                          ? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5 pt-1"
                          : "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-1"
                      }
                    >
                      {images.map((img, i) => {
                        const isDragged = draggedImageIndex === i;
                        const isTarget = dragOverIndex === i && draggedImageIndex !== i;
                        return (
                          <div
                            key={i}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={(e) => handleDragOver(e, i)}
                            onDragLeave={handleDragLeave}
                            onDrop={() => handleDrop(i)}
                            className={`group relative bg-white rounded-xl overflow-hidden border p-1 shadow-2xs flex flex-col gap-1 cursor-grab active:cursor-grabbing transition-all ${
                              isDragged
                                ? "opacity-30 scale-95 border-dashed border-black ring-2 ring-black"
                                : isTarget
                                ? "border-black ring-2 ring-black scale-102 bg-neutral-100"
                                : i === 0
                                ? "border-neutral-900 ring-1 ring-black/10"
                                : "border-neutral-300 hover:border-black"
                            }`}
                          >
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white border border-neutral-200/80">
                              <Image src={img} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" />

                              {/* Number Badge */}
                              <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                                {i === 0 ? (
                                  <div className="bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                    <span>#1 Main</span>
                                  </div>
                                ) : (
                                  <div className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                    <GripVertical className="h-2.5 w-2.5 opacity-60" />
                                    <span>#{i + 1}</span>
                                  </div>
                                )}
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(i);
                                }}
                                className="absolute top-1.5 right-1.5 bg-black/65 hover:bg-red-600 text-white p-1 rounded-md cursor-pointer shadow-md transition-colors z-10"
                                title="Remove photo"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>

                              {/* Bottom Quick-Action Toolbar */}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-4 pb-1.5 px-1.5 flex items-center justify-between opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                                {/* Move Left */}
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImageStep(i, "left");
                                  }}
                                  title="Move earlier (left)"
                                  className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>

                                {/* Make Cover Button */}
                                {i !== 0 ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveImageToFirst(i);
                                    }}
                                    title="Set as Main Cover Photo"
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-black hover:bg-amber-400 transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                  >
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    <span>Make Main</span>
                                  </button>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                                    Cover Photo
                                  </span>
                                )}

                                {/* Move Right */}
                                <button
                                  type="button"
                                  disabled={i === images.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImageStep(i, "right");
                                  }}
                                  title="Move later (right)"
                                  className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* LIVE STOREFRONT DETAIL PAGE PREVIEW TAB (1:1 Exact Match with Live Customer View) */
              <div className="px-5 sm:px-8 py-6 space-y-6 overflow-y-auto flex-1 bg-white font-helvetica">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">

                  {/* Left Section: Vertical Thumbnails + Main Image Viewer */}
                  <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
                    {/* Vertical Thumbnail List on the Left */}
                    <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[35rem] shrink-0 sm:w-20 w-full pr-0 sm:pr-1 pb-2 sm:pb-0 scroll-smooth">
                      {(images.length > 0 ? images : ["/brand-image.jpg"]).map((img, idx) => (
                        <button
                          key={idx}
                          id={`admin-preview-thumb-${idx}`}
                          type="button"
                          onClick={() => setPreviewImageIndex(idx)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 aspect-square shrink-0 bg-white overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            previewImageIndex === idx
                              ? "border-black ring-2 ring-black/10 scale-100"
                              : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                              Main
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Main Active Photo Viewer (4:3 Portrait Orientation) */}
                    <div className="relative flex-1 aspect-[3/4] w-full bg-white overflow-hidden rounded-2xl">
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
                            className="w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center text-neutral-900 hover:bg-white hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
                          >
                            <ChevronLeft className="h-5 w-5 stroke-2" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewImageIndex((prev) => (prev + 1) % images.length)}
                            aria-label="Next image"
                            className="w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center text-neutral-900 hover:bg-white hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
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
                          const modelDetailsSummary = [
                            modelHeight.trim() ? `Height: ${modelHeight.trim()}` : "",
                            modelWeight.trim() ? `Weight: ${modelWeight.trim()}kg` : "",
                          ].filter(Boolean).join(" | ");

                          const orderText = `ORDER INQUIRY - GRAIL SOCIETY\n` +
                            `• Item: ${title.trim() || "Untitled"}\n` +
                            `• Price: ${livePriceFormatted}\n` +
                            `• Tag Size: ${tagSize || "N/A"}\n` +
                            `• Measurements: ${liveFormattedMeasurements}\n` +
                            `• Condition: ${condition.trim() || "N/A"}\n` +
                            (issueText ? `• Issue: ${issueText}\n` : "") +
                            (modelDetailsSummary ? `• Model Details: ${modelDetailsSummary}\n\n` : `\n`) +
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
                      {(modelHeight.trim() || modelWeight.trim()) && (
                        <p>
                          <span className="font-semibold text-neutral-900">Model:</span>{" "}
                          {[
                            modelHeight.trim() ? `Height: ${modelHeight.trim()}` : "",
                            modelWeight.trim() ? `Weight: ${modelWeight.trim()}kg` : "",
                          ].filter(Boolean).join(" | ")}
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

      {/* Interactive Reorder Products Modal */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black text-white rounded-xl">
                  <ListOrdered className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                    Arrange Storefront Item Order
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Click &quot;Move to #&quot; to change position number, or drag rows to reorder.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Search inside Reorder Modal */}
            <div className="px-5 py-3 border-b border-neutral-100 bg-white">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={reorderSearch}
                  onChange={(e) => setReorderSearch(e.target.value)}
                  placeholder="Search item by title or category to jump..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Modal Body: Drag & Drop + Direct Position Actions */}
            <div ref={reorderContainerRef} className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-2">
              {reorderList
                .map((item, originalIndex) => ({ item, originalIndex }))
                .filter(({ item }) => {
                  if (!reorderSearch.trim()) return true;
                  const q = reorderSearch.toLowerCase().trim();
                  return (
                    item.title.toLowerCase().includes(q) ||
                    (item.collectionSlug || "").toLowerCase().includes(q) ||
                    (item.priceFormatted || "").toLowerCase().includes(q)
                  );
                })
                .map(({ item, originalIndex }) => {
                  const isHero = originalIndex === 0;
                  const isBeingDragged = draggedReorderIdx === originalIndex;
                  const isTarget = dragOverReorderIdx === originalIndex;
                  const isJumpOpen = jumpToPosId === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleReorderDragStart(e, originalIndex)}
                      onDragOver={(e) => handleReorderDragOver(e, originalIndex)}
                      onDragLeave={() => setDragOverReorderIdx(null)}
                      onDrop={() => handleReorderDrop(originalIndex)}
                      onDragEnd={() => {
                        setDraggedReorderIdx(null);
                        setDragOverReorderIdx(null);
                      }}
                      className={`flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl transition-all select-none ${
                        isBeingDragged
                          ? "opacity-30 scale-95 border-dashed border-black bg-neutral-100"
                          : isTarget
                          ? "ring-2 ring-black bg-neutral-100/90 scale-[1.01] border-neutral-300 shadow-sm"
                          : isHero
                          ? "bg-amber-50/80 border border-amber-300 shadow-2xs"
                          : "bg-white hover:bg-neutral-50 border border-neutral-200/90"
                      }`}
                    >
                      {/* Left: Drag Handle + Static Position Badge + Thumbnail + Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* Drag Handle */}
                        <div
                          className="text-neutral-400 hover:text-black cursor-grab active:cursor-grabbing p-1 shrink-0"
                          title="Drag to rearrange position"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Normal Static Position Badge */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 select-none ${
                            isHero
                              ? "bg-black text-amber-400 shadow-2xs"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          #{originalIndex + 1}
                        </div>

                        {/* Photo Thumbnail */}
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white border border-neutral-200 rounded-lg overflow-hidden shrink-0">
                          {item.images && item.images[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400">
                              No img
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                              {item.title}
                            </p>
                            {isHero && (
                              <span className="bg-amber-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0">
                                Hero #1
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[10px] sm:text-[11px] text-neutral-500 truncate">
                            <span className="font-semibold text-neutral-700">{item.priceFormatted}</span>
                            <span>•</span>
                            <span className="capitalize">{getCategoryLabel(item.collectionSlug)}</span>
                            <span>•</span>
                            <span
                              className={`inline-flex px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] uppercase font-bold ${
                                item.status === "published"
                                  ? "text-emerald-700 bg-emerald-50"
                                  : "text-amber-700 bg-amber-50"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Controls (Move to # only) */}
                      {isJumpOpen ? (
                        <div className="flex items-center gap-1.5 bg-neutral-900 text-white px-2.5 py-1.5 rounded-xl shadow-md animate-in fade-in zoom-in-95 duration-150 shrink-0">
                          <span className="text-[11px] text-neutral-300 font-bold whitespace-nowrap">Jump to #</span>
                          <input
                            type="number"
                            min="1"
                            max={reorderList.length}
                            value={jumpToPosValue}
                            onChange={(e) => setJumpToPosValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleMoveToPosition(item.id, parseInt(jumpToPosValue, 10));
                              } else if (e.key === "Escape") {
                                setJumpToPosId(null);
                              }
                            }}
                            placeholder={`1-${reorderList.length}`}
                            autoFocus
                            className="w-14 px-2 py-0.5 bg-neutral-800 text-white border border-neutral-600 rounded-lg text-xs font-bold text-center focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleMoveToPosition(item.id, parseInt(jumpToPosValue, 10))}
                            className="px-2.5 py-1 bg-amber-400 text-black text-[11px] font-black rounded-lg hover:bg-amber-300 cursor-pointer transition-colors"
                          >
                            Go
                          </button>
                          <button
                            type="button"
                            onClick={() => setJumpToPosId(null)}
                            className="p-1 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center shrink-0">
                          {/* Jump to specific position button */}
                          <button
                            type="button"
                            onClick={() => {
                              setJumpToPosId(item.id);
                              setJumpToPosValue(String(originalIndex + 1));
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                            title="Move directly to position number"
                          >
                            <Hash className="h-3.5 w-3.5 text-neutral-500" />
                            <span>Move to #</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {reorderList.length === 0 && (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No items in inventory to reorder.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">Quick Sort:</span>
                <button
                  type="button"
                  onClick={() => {
                    const sortedByDate = [...reorderList].sort(
                      (a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime()
                    );
                    setReorderList(sortedByDate);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-200/70 rounded-xl transition-colors cursor-pointer border border-neutral-200/80 bg-white shadow-2xs"
                >
                  Newest First
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sortedByPriceDesc = [...reorderList].sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
                    setReorderList(sortedByPriceDesc);
                  }}
                  className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-200/70 rounded-xl transition-colors cursor-pointer border border-neutral-200/80 bg-white shadow-2xs"
                >
                  Price: High → Low
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSavingReorder}
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-black rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingReorder}
                  onClick={handleSaveReorder}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-colors shadow-sm"
                >
                  {isSavingReorder ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Order...</span>
                    </>
                  ) : reorderSavedSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Sequence</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team / Admin Accounts Management Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black text-white rounded-xl">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                    Admin Team Management
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Manage accounts and credentials. Both Owner and Admin roles have equal full access.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {adminModalTab === "list" ? (
                /* ACCOUNTS LIST VIEW */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                        Registered Accounts ({adminUsers.length || 1})
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Each admin has their own designated username and password.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateAdmin}
                      className="px-3.5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Add Admin</span>
                    </button>
                  </div>

                  {/* Accounts Cards List */}
                  <div className="space-y-2.5">
                    {adminUsers.length > 0 ? (
                      adminUsers.map((admin) => {
                        const isCurrent = currentUser?.id === admin.id;
                        return (
                          <div
                            key={admin.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isCurrent
                                ? "bg-amber-50/50 border-amber-300"
                                : "bg-neutral-50/80 border-neutral-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-2xs ${
                                  admin.role === "owner"
                                    ? "bg-black text-amber-400"
                                    : "bg-neutral-900 text-white"
                                }`}
                              >
                                {admin.fullName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-neutral-900 truncate">
                                    {admin.fullName}
                                  </h4>
                                  {isCurrent && (
                                    <span className="bg-amber-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0">
                                      You
                                    </span>
                                  )}
                                  <span
                                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                      admin.role === "owner"
                                        ? "bg-amber-100 text-amber-900 border border-amber-300 font-black"
                                        : "bg-neutral-200 text-neutral-800"
                                    }`}
                                  >
                                    {admin.role === "owner" ? "Owner" : "Admin"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
                                  <span className="font-semibold text-neutral-700">@{admin.username}</span>
                                  {admin.email && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{admin.email}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-400 mt-1">
                                  {admin.lastLoginAt
                                    ? `Last login: ${new Date(admin.lastLoginAt).toLocaleString()}`
                                    : "Never logged in yet"}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60 w-full sm:w-auto justify-end">
                              <button
                                type="button"
                                onClick={() => openEditAdmin(admin)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Edit / Password</span>
                              </button>
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdmin(admin)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                  title="Delete Admin Account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-300 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black text-amber-400 flex items-center justify-center font-black text-sm uppercase shrink-0">
                            A
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-neutral-900">
                                Main Admin
                              </h4>
                              <span className="bg-amber-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                Default Master
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600">@admin • admin@grailsociety.com</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* CREATE / EDIT FORM VIEW */
                <form onSubmit={handleSaveAdminUser} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Key className="h-4 w-4 text-neutral-600" />
                      <span>
                        {adminModalTab === "create"
                          ? "Add New Admin Account"
                          : `Edit Account: @${adminFormUsername}`}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminModalTab("list");
                        setAdminFormError(null);
                        setAdminFormSuccess(null);
                      }}
                      className="text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer"
                    >
                      ← Back to Accounts
                    </button>
                  </div>

                  {adminFormError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium animate-in fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{adminFormError}</span>
                    </div>
                  )}

                  {adminFormSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-medium animate-in fade-in">
                      <Check className="h-4 w-4 shrink-0 text-emerald-500 stroke-[3]" />
                      <span>{adminFormSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminFormFullName}
                        onChange={(e) => setAdminFormFullName(e.target.value)}
                        placeholder="e.g. Sam Johnson"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={adminFormUsername}
                        onChange={(e) => setAdminFormUsername(e.target.value)}
                        placeholder="e.g. sam"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors lowercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5 flex items-center justify-between">
                        <span>Email Address</span>
                        <span className="text-[10px] text-neutral-400 font-normal lowercase">optional</span>
                      </label>
                      <input
                        type="email"
                        value={adminFormEmail}
                        onChange={(e) => setAdminFormEmail(e.target.value)}
                        placeholder="e.g. sam@grailsociety.com"
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5">
                        Access Role
                      </label>
                      <select
                        value={adminFormRole}
                        onChange={(e: any) => setAdminFormRole(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors h-[42px]"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 uppercase mb-1.5 flex items-center justify-between">
                      <span>
                        {adminModalTab === "create" ? "Account Password" : "New Password"}
                        {adminModalTab === "create" && <span className="text-red-500 ml-0.5">*</span>}
                      </span>
                      {adminModalTab === "edit" && (
                        <span className="text-[10px] text-neutral-400 font-normal lowercase">
                          leave blank to keep current password
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required={adminModalTab === "create"}
                        value={adminFormPassword}
                        onChange={(e) => setAdminFormPassword(e.target.value)}
                        placeholder={
                          adminModalTab === "create"
                            ? "Set secure password (min 6 chars)..."
                            : "Enter new password to reset..."
                        }
                        className="w-full pl-4 pr-11 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                        title={showAdminPassword ? "Hide password" : "Show password"}
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Active Toggle for Edit Mode */}
                  {adminModalTab === "edit" && (
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={adminFormActive}
                          onChange={(e) => setAdminFormActive(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 accent-black cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-neutral-800">
                          Account Active (uncheck to disable access)
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Submit Actions */}
                  <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAdminModalTab("list");
                        setAdminFormError(null);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAdminSubmitting}
                      className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {isAdminSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving Account...</span>
                        </>
                      ) : (
                        <span>
                          {adminModalTab === "create" ? "Create Admin Account" : "Update Account"}
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Sticky Footer for List View */}
            {adminModalTab === "list" && (
              <div className="p-4 sm:px-6 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between shrink-0">
                <p className="text-[11px] text-neutral-500">
                  Both Owner and Admin have equal full access. Sign in with unique username or email.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-5 py-2 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}