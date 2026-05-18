import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  Heart, Sparkles, AlertTriangle, ArrowUpRight, Bed, Bath, Maximize2, 
  ShieldCheck, Star, MapPin, Building, MessageSquare, PlusCircle, Trash2, 
  Info, Calendar, Clock, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SavedPropertyService } from "@/services/saved-property.service";
import { ConversationService } from "@/services/conversation.service";
import { BookingRequestService } from "@/services/booking-request.service";
import type { Property } from "@/services/property.service";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-apartment.jpg";

export const Route = createFileRoute("/_authenticated/app/saved")({ component: Saved });

function Saved() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Modal states for Quick Preview / Rent Application
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");

  // 1. Fetch saved listings
  const { data: saved = [], isLoading: loadingSaved } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => SavedPropertyService.getSavedListings(),
  });

  // 2. Fetch recommendations based on user interest
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery({
    queryKey: ["savedRecommendations"],
    queryFn: () => SavedPropertyService.getRecommendations(),
  });

  // Separate active properties vs unavailable/archived listings
  const availableSaved = useMemo(() => {
    return saved.filter((p) => p.status === "PUBLISHED" && p.rooms?.some((r) => r.isAvailable));
  }, [saved]);

  const unavailableSaved = useMemo(() => {
    return saved.filter((p) => p.status !== "PUBLISHED" || !p.rooms?.some((r) => r.isAvailable));
  }, [saved]);

  const recentlySaved = useMemo(() => {
    return availableSaved.slice(0, 3);
  }, [availableSaved]);

  // Unsave listing optimistic mutation
  const unsaveMutation = useMutation({
    mutationFn: (id: string) => SavedPropertyService.unsave(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["savedProperties"] });
      await queryClient.cancelQueries({ queryKey: ["savedCount"] });

      const previousSaved = queryClient.getQueryData<Property[]>(["savedProperties"]) || [];
      const previousCount = queryClient.getQueryData<{ count: number }>(["savedCount"]) || { count: 0 };

      // Optimistic update
      queryClient.setQueryData(
        ["savedProperties"],
        previousSaved.filter((p) => p.id !== id)
      );
      queryClient.setQueryData(["savedCount"], { count: Math.max(0, previousCount.count - 1) });

      return { previousSaved, previousCount };
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(["savedProperties"], context.previousSaved);
        queryClient.setQueryData(["savedCount"], context.previousCount);
      }
      toast.error("Failed to unsave property.");
    },
    onSuccess: () => {
      toast.success("Removed from saved list");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["savedCount"] });
      queryClient.invalidateQueries({ queryKey: ["savedRecommendations"] });
    },
  });

  // Initiate contextual chat with landlord
  const startChatMutation = useMutation({
    mutationFn: async ({ landlordId, propertyId }: { landlordId: string; propertyId: string }) => {
      return ConversationService.findOrCreateGeneral(landlordId, propertyId);
    },
    onSuccess: (conversation) => {
      toast.success("Chat resolved. Opening messenger thread...");
      navigate({
        to: "/app/messages" as any,
        search: { activeId: conversation.id } as any,
      });
    },
    onError: () => {
      toast.error("Failed to start direct chat with this host.");
    },
  });

  // Submit booking rental request
  const bookingMutation = useMutation({
    mutationFn: (dto: { propertyId: string; roomId: string; note: string; proposedMoveInDate: string }) => 
      BookingRequestService.create(dto),
    onSuccess: () => {
      toast.success("Rental application submitted successfully!");
      setPreviewProperty(null);
      setMoveInDate("");
      setBookingNote("");
      queryClient.invalidateQueries({ queryKey: ["tenantBookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit request.");
    }
  });

  const handleApplyBooking = (e: React.FormEvent, property: Property) => {
    e.preventDefault();
    const targetRoomId = property.rooms?.[0]?.id;
    if (!targetRoomId) {
      toast.error("This property does not have any available rooms to rent.");
      return;
    }
    if (!moveInDate) {
      toast.error("Please select a proposed move-in date.");
      return;
    }
    bookingMutation.mutate({
      propertyId: property.id,
      roomId: targetRoomId,
      note: bookingNote,
      proposedMoveInDate: moveInDate,
    });
  };

  const isLoading = loadingSaved || loadingRecs;

  return (
    <div className="space-y-12 max-w-7xl">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> Saved Listings
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Danh sách đã lưu của bạn</h1>
          <p className="text-muted-foreground mt-1 max-w-lg">
            Track properties of interest, initiate instant chats with hosts, and submit active rental requests directly.
          </p>
        </div>
        <Button asChild className="rounded-xl h-11 shadow-sm gap-2">
          <Link to="/app/explore">
            Explore More Listings <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto shadow-sm">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="mt-6 text-xl font-bold">Chưa lưu chỗ ở nào</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Tap the heart icon on standard exploration properties to keep track of premium listings, compare prices, and start chat dialogues.
          </p>
          <Button asChild className="mt-8 rounded-xl px-6 h-11">
            <Link to="/app/explore">Start exploring</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-14">
          {/* 2. 🔥 Recently Saved Section */}
          {recentlySaved.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 grid place-items-center font-bold">🔥</div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Saved gần đây</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Quick tracking of your most recently favorited available rentals.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlySaved.map((p, i) => (
                  <PremiumSavedCard
                    key={p.id}
                    p={p}
                    index={i}
                    onUnsave={() => unsaveMutation.mutate(p.id)}
                    onChat={() => startChatMutation.mutate({ landlordId: p.landlordId, propertyId: p.id })}
                    onOpenPreview={() => setPreviewProperty(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 3. 📁 All Saved Listings Grid */}
          {availableSaved.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center"><Building className="h-4.5 w-4.5" /></div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Tất cả chỗ ở đã lưu ({availableSaved.length})</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">List of active properties currently matching all capacity limits.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSaved.map((p, i) => (
                  <PremiumSavedCard
                    key={p.id}
                    p={p}
                    index={i}
                    onUnsave={() => unsaveMutation.mutate(p.id)}
                    onChat={() => startChatMutation.mutate({ landlordId: p.landlordId, propertyId: p.id })}
                    onOpenPreview={() => setPreviewProperty(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 4. ⚠ Unavailable / Archived Section */}
          {unavailableSaved.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 grid place-items-center"><AlertTriangle className="h-4.5 w-4.5" /></div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Không còn trống / Lưu trữ ({unavailableSaved.length})
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Rentals with full occupancy capacity or archived by landlords.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-25">
                {unavailableSaved.map((p, i) => (
                  <PremiumSavedCard
                    key={p.id}
                    p={p}
                    index={i}
                    isUnavailable={true}
                    onUnsave={() => unsaveMutation.mutate(p.id)}
                    onChat={() => startChatMutation.mutate({ landlordId: p.landlordId, propertyId: p.id })}
                    onOpenPreview={() => setPreviewProperty(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 5. 🏠 Recommended Based On Saved (Airbnb-Style Carousel) */}
          {recommendations.length > 0 && (
            <section className="space-y-6 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 grid place-items-center"><Sparkles className="h-4.5 w-4.5" /></div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gợi ý chỗ ở tương tự</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Intelligent matches sharing city, district, or room characteristics.</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((p, i) => (
                  <PremiumRecommendationCard
                    key={p.id}
                    p={p}
                    index={i}
                    onSave={() => SavedPropertyService.save(p.id).then(() => {
                      toast.success("Saved to favorites!");
                      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
                      queryClient.invalidateQueries({ queryKey: ["savedCount"] });
                      queryClient.invalidateQueries({ queryKey: ["savedRecommendations"] });
                    })}
                    onOpenPreview={() => setPreviewProperty(p)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 6. Dynamic Framer Motion Quick Preview Modal (with pre-filled Rental Application Form) */}
      <AnimatePresence>
        {previewProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProperty(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-surface ring-1 ring-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row border border-border"
            >
              {/* Close Button */}
              <button 
                onClick={() => setPreviewProperty(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background/80 hover:bg-background backdrop-blur grid place-items-center hover:scale-105 transition shadow-sm z-30 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Left visual column */}
              <div className="w-full md:w-1/2 relative bg-secondary aspect-video md:aspect-auto overflow-hidden">
                <img 
                  src={previewProperty.images?.[0]?.url || heroImg} 
                  alt={previewProperty.title} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {previewProperty.type}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white line-clamp-2 mt-1">{previewProperty.title}</h3>
                  <p className="text-xs text-white/85 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary-foreground" /> {previewProperty.district}, {previewProperty.city}
                  </p>
                </div>
              </div>

              {/* Right content/form column */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[50vh] md:max-h-[85vh] space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5 font-bold text-sm">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 4.9
                      </span>
                      <span className="text-xs text-muted-foreground">(24 reviews)</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Listing
                    </span>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">
                        ${previewProperty.rooms?.[0] ? Number(previewProperty.rooms[0].price) : 250}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-2xl border border-border/40">
                      <div className="text-center space-y-1">
                        <Bed className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">
                          {previewProperty.rooms?.[0]?.capacity || 1} Beds
                        </span>
                      </div>
                      <div className="text-center space-y-1 border-x border-border/50">
                        <Bath className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">1 Bath</span>
                      </div>
                      <div className="text-center space-y-1">
                        <Maximize2 className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">
                          {previewProperty.rooms?.[0]?.area || 25} m²
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">About this place</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {previewProperty.description || "Beautiful, sunny living space offering convenient access to local universities, supermarkets, and cafes. Completely furnished with premium beddings, desks, and air-conditioning systems."}
                    </p>
                  </div>
                </div>

                {/* Direct Action Booking Form */}
                {previewProperty.status === "PUBLISHED" && previewProperty.rooms?.some((r) => r.isAvailable) ? (
                  <form 
                    onSubmit={(e) => handleApplyBooking(e, previewProperty)} 
                    className="pt-4 border-t border-border/60 mt-4 space-y-3 bg-secondary/25 p-4 rounded-2xl border border-border/30"
                  >
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Gửi Yêu Cầu Thuê Chỗ Này
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="modalMoveIn" className="text-[10px] font-semibold text-muted-foreground block">Proposed Move-in Date</label>
                      <Input 
                        id="modalMoveIn"
                        type="date"
                        required
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        className="bg-background border-border/80 rounded-xl h-10 text-xs px-3"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="modalNote" className="text-[10px] font-semibold text-muted-foreground block">Message to Landlord</label>
                      <Input 
                        id="modalNote"
                        placeholder="Introduce yourself, workplace, RMIT student..."
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                        className="bg-background border-border/80 rounded-xl h-10 text-xs px-3"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={bookingMutation.isPending}
                      className="w-full rounded-xl h-10 text-xs font-semibold shadow-[var(--shadow-glow)] mt-2"
                    >
                      {bookingMutation.isPending ? "Sending request..." : "Apply to Rent Unit"}
                    </Button>
                  </form>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium text-center space-y-1">
                    <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                    <p className="font-bold">This property is currently full or archived.</p>
                    <p className="text-[10px] text-muted-foreground">Standard rental requests are locked for inactive listings.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// PREMIUM SAVED CARD COMPONENT
function PremiumSavedCard({
  p,
  index,
  isUnavailable = false,
  onUnsave,
  onChat,
  onOpenPreview
}: {
  p: Property;
  index: number;
  isUnavailable?: boolean;
  onUnsave: () => void;
  onChat: () => void;
  onOpenPreview: () => void;
}) {
  const image = p.images?.[0]?.url || heroImg;
  const location = `${p.district}, ${p.city}`;
  const room = p.rooms?.[0];
  const price = room ? Number(room.price) : 250;
  const beds = room ? room.capacity : 1;
  const area = room ? room.area : 25;
  const landlordName = p.landlord?.user?.fullName || "Chủ nhà Trovia";
  const initials = landlordName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={cn(
        "group relative rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden hover:shadow-elegant transition flex flex-col border border-transparent hover:border-border/60",
        isUnavailable && "opacity-80 hover:opacity-100"
      )}
    >
      {/* 1. Visual Card Header */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img 
          src={image} 
          alt={p.title} 
          className="h-full w-full object-cover group-hover:scale-102 transition duration-500" 
        />
        
        {/* Unsave (Heart) Toggle Button */}
        <button 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition shadow-sm z-20 cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnsave(); }}
          aria-label="Remove Save"
        >
          <Heart className="h-4.5 w-4.5 fill-red-500 text-red-500 transition-transform active:scale-90" />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-20">
          <span className="text-[10px] font-semibold bg-background/90 backdrop-blur px-2.5 py-0.5 rounded-md text-foreground border border-border/20 uppercase tracking-wide">
            {p.type}
          </span>
          {isUnavailable ? (
            <span className="text-[9px] font-bold bg-red-500 text-white px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              Archived / Full
            </span>
          ) : (
            <span className="text-[9px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              Available Room
            </span>
          )}
        </div>

        {/* Landlord profile overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 z-20">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-[9px] font-bold shrink-0">
            {initials}
          </div>
          <span className="text-[10px] font-semibold text-white/95 line-clamp-1 truncate max-w-32">{landlordName}</span>
        </div>
      </div>

      {/* 2. Text / Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {p.title}
            </h3>
            <span className="flex items-center gap-0.5 text-xs font-bold shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> 4.9
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {location}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5 border-t border-border/40">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-primary" /> {beds} Beds</span>
            <span className="flex items-center gap-1 border-l border-border pl-3"><Maximize2 className="h-3.5 w-3.5 text-primary" /> {area} m²</span>
          </div>
        </div>

        {/* 3. Price & Quick-Actions Drawer */}
        <div className="space-y-3 pt-3 border-t border-border/50">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-bold text-foreground">${price}</span>
              <span className="text-[10px] text-muted-foreground">/mo</span>
            </div>
            
            {p.createdAt && (
              <span className="text-[9px] text-muted-foreground/80 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" /> Updated: {new Date(p.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 select-none">
            {/* 1. Xem chi tiết */}
            <button 
              onClick={onOpenPreview}
              className="text-[10px] font-bold py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition text-center cursor-pointer flex items-center justify-center gap-1"
            >
              Chi tiết
            </button>
            
            {/* 2. Nhắn tin */}
            <button 
              onClick={onChat}
              className="text-[10px] font-bold py-2 rounded-lg bg-primary-soft hover:bg-primary-soft/80 text-primary transition text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <MessageSquare className="h-3 w-3 fill-primary text-primary" /> Chat
            </button>

            {/* 3. Gửi yêu cầu thuê */}
            <button 
              disabled={isUnavailable}
              onClick={onOpenPreview}
              className={cn(
                "text-[10px] font-bold py-2 rounded-lg text-white transition text-center cursor-pointer flex items-center justify-center gap-1",
                isUnavailable 
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/95 shadow-sm"
              )}
            >
              Thuê
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// PREMIUM RECOMMENDATION CARD COMPONENT
function PremiumRecommendationCard({
  p,
  index,
  onSave,
  onOpenPreview
}: {
  p: Property;
  index: number;
  onSave: () => void;
  onOpenPreview: () => void;
}) {
  const image = p.images?.[0]?.url || heroImg;
  const location = `${p.district}, ${p.city}`;
  const room = p.rooms?.[0];
  const price = room ? Number(room.price) : 250;
  const beds = room ? room.capacity : 1;
  const area = room ? room.area : 25;
  const landlordName = p.landlord?.user?.fullName || "Chủ nhà Trovia";
  const initials = landlordName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group relative rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden hover:shadow-elegant transition flex flex-col border border-transparent hover:border-border/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img 
          src={image} 
          alt={p.title} 
          className="h-full w-full object-cover group-hover:scale-102 transition duration-500" 
        />
        
        {/* Save button (Unfilled Heart) */}
        <button 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition shadow-sm z-20 cursor-pointer"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(); }}
          aria-label="Save Listing"
        >
          <Heart className="h-4.5 w-4.5 text-foreground transition-transform active:scale-90" />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-20">
          <span className="text-[10px] font-semibold bg-background/90 backdrop-blur px-2.5 py-0.5 rounded-md text-foreground border border-border/20 uppercase tracking-wide">
            {p.type}
          </span>
          <span className="text-[9px] font-bold bg-purple-500 text-white px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            💡 Recommended
          </span>
        </div>

        {/* Host overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 z-20">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-[9px] font-bold shrink-0">
            {initials}
          </div>
          <span className="text-[10px] font-semibold text-white/95 line-clamp-1 truncate max-w-32">{landlordName}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {p.title}
            </h3>
            <span className="flex items-center gap-0.5 text-xs font-bold shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> 4.9
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {location}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5 border-t border-border/40">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-primary" /> {beds} Beds</span>
            <span className="flex items-center gap-1 border-l border-border pl-3"><Maximize2 className="h-3.5 w-3.5 text-primary" /> {area} m²</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-foreground">${price}</span>
            <span className="text-[10px] text-muted-foreground">/mo</span>
          </div>

          <button 
            onClick={onOpenPreview}
            className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Chi tiết & Apply <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
