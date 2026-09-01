import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Gift,
  Calendar,
  Tag,
  ShieldCheck,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Package,
  Box,
  Layers,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Bookmark,
  Share2,
} from "lucide-react";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { toast } from "react-toastify";
import { API } from "../../services/api_service";
import { APIROUTES, IMAGE_URL } from "../../routes/api_routes";

const GiftCardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [qty, setQty] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const response = await API.post(APIROUTES.GIFTDETAILS, {
          giftid: parseInt(id),
          itemtype: "gift",
        });
        if (response.data && response.data.statusCode === 200) {
          const data = response.data.data;
          setDetail(data);
          if (data?.giftdetail?.stock) {
            setQty(data.giftdetail.stock);
          }
          if (data?.giftdetail?.giftimage) {
            setSelectedImage(data.giftdetail.giftimage);
          }
        } else {
          toast.error(response.data?.message || "Failed to fetch gift details");
        }
      } catch (error) {
        console.error("Fetch gift details error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Loading Gift Specifications...
        </p>
      </div>
    );
  }

  const g = detail ? detail.giftdetail : null;

  if (!g) {
    return (
      <div className="py-20 text-center space-y-3">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="text-gray-600 font-bold text-base">
          Gift Pack not found.
        </p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="text-xs"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const displayImages = [
    g.giftimage,
    g.image1,
    g.image2,
    g.image3,
    g.image4,
  ].filter(Boolean);
  const currentDisplayImg = selectedImage
    ? `${IMAGE_URL}${selectedImage}`
    : "https://picsum.photos/600";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gifts
        </button>
        {/* <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 text-xs rounded-lg font-bold"
            onClick={() => toast.info("Link shared successfully!")}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
          <Button
            variant="primary"
            className="h-9 text-xs rounded-lg shadow-2xs"
            onClick={() => toast.success("Edit specification trigger")}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Hamper
          </Button>
        </div> */}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Showcase (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="overflow-hidden p-2 shadow-xs border border-border rounded-xl">
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
              <img
                src={currentDisplayImg}
                alt={g.giftname}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://picsum.photos/600";
                }}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <Badge
                  variant="accent"
                  className="text-[10px] font-bold px-2 py-0.5 shadow-xs"
                >
                  Hamper Pack
                </Badge>
                {g.categoryname && (
                  <Badge
                    variant="warning"
                    className="text-[10px] font-bold px-2 py-0.5 shadow-xs"
                  >
                    {g.categoryname}
                  </Badge>
                )}
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2 custom-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? "border-primary shadow-xs"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`${IMAGE_URL}${img}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Specifications & Overview (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <Gift className="w-4 h-4 text-primary" /> SKU: GIFT-00{g.giftid}
              </div>
              <Badge
                variant="success"
                className="text-xs font-bold px-2.5 py-1 rounded-md"
              >
                Hamper Collection
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {g.giftname}
              </h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />{" "}
                {g.categoryname || "Category"} &bull;{" "}
                {g.subcategoryname || "Subcategory"}
              </p>
            </div>

            {/* Pricing Section matching Native App Theme */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                  Hamper Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-primary">
                    ₹{g.giftsellingprice > 0 ? g.giftsellingprice : g.giftprice}
                  </span>
                  {g.giftsellingprice > 0 &&
                    g.giftsellingprice < g.giftprice && (
                      <span className="text-sm font-semibold text-gray-400 line-through">
                        ₹{g.giftprice}
                      </span>
                    )}
                </div>
              </div>
              {g.discount > 0 && (
                <Badge
                  variant="accent"
                  className="font-bold text-xs px-3 py-1 shadow-xs"
                >
                  {g.discount}% OFF
                </Badge>
              )}
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-xs border border-border overflow-hidden">
            <div className="flex border-b border-border bg-gray-50/50 px-2 pt-2 gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Curator's Note
              </button>
              <button
                onClick={() => setActiveTab("contents")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "contents"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Hamper Contents
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "specs"
                    ? "bg-white text-primary border-t border-x border-border font-extrabold shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" /> Packaging & Type
              </button>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Hamper Description
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium italic whitespace-pre-wrap">
                    "{g.giftdescription || "No description provided."}"
                  </p>
                </div>
              )}

              {activeTab === "contents" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Included Hamper Items
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {g.productlist && g.productlist.length > 0 ? (
                      g.productlist.map((p, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-50 rounded-lg border border-border flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-gray-800">
                            {p.name}
                          </span>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                      ))
                    ) : (
                      <div className="sm:col-span-2 p-6 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-lg border border-dashed border-border">
                        No product items specified in this hamper structure.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Packaging Architecture
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-border p-3.5 rounded-lg flex items-center gap-3">
                      <Box className="w-6 h-6 text-primary" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Box Type
                        </span>
                        <span className="text-xs font-bold text-gray-800 block mt-0.5">
                          {g.packingtype || "Premium Traditional Box"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-border p-3.5 rounded-lg flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Classification
                        </span>
                        <span className="text-xs font-bold text-gray-800 block mt-0.5">
                          {g.categoryname || "Nuts Gift Packs"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardDetail;
