import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  Grid3x3, List, Map, SlidersHorizontal, Search as SearchIcon, 
  MapPin, Bed, Bath, Maximize2, ShieldCheck, Heart, Star,
  DollarSign, Sparkles, Building, Eye, Calendar, Clock, MessageSquare, X,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListingService, type SearchListingsFilters } from "@/services/listing.service";
import { BookingRequestService } from "@/services/booking-request.service";
import { SavedPropertyService } from "@/services/saved-property.service";
import type { PropertyType } from "@/services/property.service";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-apartment.jpg";

export const Route = createFileRoute("/_authenticated/app/explore")({ component: Explore });

// Comprehensive filter chips
const filterChips = [
  { label: "All", filter: {} },
  { label: "Verified Only", filter: { verified: true } },
  { label: "Studio", filter: { type: "STUDIO" as PropertyType } },
  { label: "Apartment", filter: { type: "APARTMENT" as PropertyType } },
  { label: "Under $400", filter: { maxPrice: 400 } },
  { label: "Premium ($600+)", filter: { minPrice: 600 } },
];

function Explore() {
  const queryClient = useQueryClient();
  
  // Navigation & View states
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeChip, setActiveChip] = useState("All");
  
  // Search state variables
  const [searchLocation, setSearchLocation] = useState("");
  const [searchUniversity, setSearchUniversity] = useState("");
  const [searchType, setSearchType] = useState<string>("ALL");
  const [searchBudget, setSearchBudget] = useState<string>("ALL");
  
  // Active applied filters
  const [appliedFilters, setAppliedFilters] = useState<SearchListingsFilters>({});
  
  // State for Quick Preview Modal
  const [previewProperty, setPreviewProperty] = useState<any | null>(null);
  
  // Booking request form state
  const [moveInDate, setMoveInDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  
  // Fetch real saved properties for the user
  const { data: savedList = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => SavedPropertyService.getSavedListings(),
  });

  const savedPropertyIds = useMemo(() => savedList.map((p) => p.id), [savedList]);

  const activeChipFilter = filterChips.find((c) => c.label === activeChip)?.filter || {};

  // Combine applied smart search filters + active chip filter
  const apiFilters = useMemo((): SearchListingsFilters => {
    const filters: SearchListingsFilters = {
      ...appliedFilters,
      ...activeChipFilter,
      limit: 20
    };
    return filters;
  }, [appliedFilters, activeChipFilter]);

  // Fetch verified rentals from DB
  const { data, isLoading } = useQuery({
    queryKey: ["exploreListings", apiFilters],
    queryFn: () => ListingService.search(apiFilters),
  });

  const listings = data?.listings || [];

  // Toggle Save Listing optimistic mutation
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ id, isCurrentlySaved }: { id: string; isCurrentlySaved: boolean }) => {
      if (isCurrentlySaved) {
        return SavedPropertyService.unsave(id);
      } else {
        return SavedPropertyService.save(id);
      }
    },
    onMutate: async ({ id, isCurrentlySaved }) => {
      // Cancel outstanding queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["savedProperties"] });
      await queryClient.cancelQueries({ queryKey: ["savedCount"] });

      // Snapshot the previous values
      const previousSaved = queryClient.getQueryData<any[]>(["savedProperties"]) || [];
      const previousCount = queryClient.getQueryData<{ count: number }>(["savedCount"]) || { count: 0 };

      // Optimistically update
      if (isCurrentlySaved) {
        queryClient.setQueryData(
          ["savedProperties"],
          previousSaved.filter((p) => p.id !== id)
        );
        queryClient.setQueryData(["savedCount"], { count: Math.max(0, previousCount.count - 1) });
      } else {
        // Find property in search list to append to saved properties
        const found = listings.find((p) => p.id === id);
        if (found) {
          queryClient.setQueryData(["savedProperties"], [...previousSaved, found]);
        }
        queryClient.setQueryData(["savedCount"], { count: previousCount.count + 1 });
      }

      return { previousSaved, previousCount };
    },
    onError: (err, variables, context) => {
      // Rollback cache state
      if (context) {
        queryClient.setQueryData(["savedProperties"], context.previousSaved);
        queryClient.setQueryData(["savedCount"], context.previousCount);
      }
      toast.error("Failed to update save status.");
    },
    onSuccess: (data, variables) => {
      if (variables.isCurrentlySaved) {
        toast.success("Removed from saved list");
      } else {
        toast.success("Saved to your favorites!");
      }
    },
    onSettled: () => {
      // Sync in-flight queries
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
      queryClient.invalidateQueries({ queryKey: ["savedCount"] });
      queryClient.invalidateQueries({ queryKey: ["savedRecommendations"] });
    },
  });

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlySaved = savedPropertyIds.includes(id);
    toggleSaveMutation.mutate({ id, isCurrentlySaved });
  };

  // Submit rental application mutation
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

  // Handle smart search form submit
  const handleSmartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters: SearchListingsFilters = {};

    if (searchLocation) {
      newFilters.city = searchLocation;
    }
    if (searchType !== "ALL") {
      newFilters.type = searchType as PropertyType;
    }
    if (searchBudget !== "ALL") {
      const [min, max] = searchBudget.split("-").map(Number);
      if (min) newFilters.minPrice = min;
      if (max) newFilters.maxPrice = max;
    }
    
    setAppliedFilters(newFilters);
    toast.success("Applied search parameters!");
  };

  // Handle booking form submission
  const handleApplyBooking = (e: React.FormEvent, property: any) => {
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

  return (
    <div className="space-y-10 max-w-7xl">
      
      {/* Header section with smart proptech styling */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Premium Rental Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Khám phá chỗ ở lý tưởng</h1>
          <p className="text-muted-foreground mt-1 max-w-lg">
            Find and apply directly to verified student rooms, service studios, and full apartments in Vietnam's urban centers.
          </p>
        </div>

        {/* View toggles & maps */}
        <div className="flex items-center gap-3 self-start md:self-end">
          <div className="flex items-center bg-secondary/50 rounded-xl p-1 border border-border/40">
            <button 
              onClick={() => setView("grid")} 
              className={cn("p-2 rounded-lg cursor-pointer transition", view === "grid" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              aria-label="Grid View"
            >
              <Grid3x3 className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => setView("list")} 
              className={cn("p-2 rounded-lg cursor-pointer transition", view === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              aria-label="List View"
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>
          <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/60"><Map className="h-4.5 w-4.5" /> Bản đồ</Button>
          <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/60"><SlidersHorizontal className="h-4.5 w-4.5" /> Bộ lọc</Button>
        </div>
      </div>

      {/* 1. Large Smart Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-elegant relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Building className="h-24 w-24 text-primary" />
        </div>
        <form onSubmit={handleSmartSearch} className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Smart Discovery Engine
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Input */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Location / City</label>
              <Input 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="e.g. Ho Chi Minh, District 7" 
                className="bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:ring-primary/20 rounded-xl h-11 text-sm pl-4"
              />
            </div>

            {/* University / Landmark input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Building className="h-3.5 w-3.5" /> Nearby University / Workplace</label>
              <Input 
                value={searchUniversity}
                onChange={(e) => setSearchUniversity(e.target.value)}
                placeholder="e.g. RMIT, Ton Duc Thang" 
                className="bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:ring-primary/20 rounded-xl h-11 text-sm pl-4"
              />
            </div>

            {/* Room Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Grid3x3 className="h-3.5 w-3.5" /> Room Type</label>
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:ring-primary/20 focus:ring-2 rounded-xl h-11 text-sm px-3 appearance-none font-medium cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="STUDIO">Studio Apartment</option>
                <option value="BOARDING_HOUSE">Boarding Room / Trọ</option>
                <option value="APARTMENT">Full Apartment</option>
                <option value="DORMITORY">Dormitory</option>
              </select>
            </div>

            {/* Budget Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Monthly Budget</label>
              <select 
                value={searchBudget}
                onChange={(e) => setSearchBudget(e.target.value)}
                className="w-full bg-secondary/40 border-transparent hover:bg-secondary/60 focus:bg-background focus:ring-primary/20 focus:ring-2 rounded-xl h-11 text-sm px-3 appearance-none font-medium cursor-pointer"
              >
                <option value="ALL">Any Budget</option>
                <option value="0-200">Under $200 (≈5M VND)</option>
                <option value="200-400">$200 - $400 (5M - 10M VND)</option>
                <option value="400-600">$400 - $600 (10M - 15M VND)</option>
                <option value="600-99999">$600+ (Premium)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="px-8 rounded-xl h-11 font-medium shadow-[var(--shadow-glow)] gap-2">
              <SearchIcon className="h-4 w-4" /> Search Places
            </Button>
          </div>
        </form>
      </motion.div>

      {/* 2. Filter chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">Quick Filters:</span>
        <div className="flex gap-2">
          {filterChips.map((c) => (
            <button 
              key={c.label} 
              onClick={() => setActiveChip(c.label)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold transition border cursor-pointer shrink-0",
                activeChip === c.label 
                  ? "bg-foreground text-background border-foreground shadow-sm" 
                  : "bg-background border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main listings section */}
      <div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl p-8 max-w-lg mx-auto mt-6">
            <div className="h-12 w-12 rounded-full bg-secondary text-muted-foreground grid place-items-center mx-auto mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Không tìm thấy phòng phù hợp</h3>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              No matching listings are currently registered with these search parameters. Adjust filters, budget limits, or locations to see more options.
            </p>
            <Button variant="outline" onClick={() => { setAppliedFilters({}); setActiveChip("All"); }} className="mt-4 rounded-xl">Reset all filters</Button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Split listings in sections for personalized discover-first feel */}
            <section className="space-y-6">
              <div className="flex items-end justify-between pb-3 border-b border-border/60">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-primary" /> Recommended For You
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">High-rated rentals matching your student profile and save history</p>
                </div>
              </div>
              
              <div className={cn(view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
                {listings.slice(0, 6).map((p, i) => (
                  <ListingCard 
                    key={p.id} 
                    p={p} 
                    index={i} 
                    view={view}
                    isSaved={savedPropertyIds.includes(p.id)}
                    onToggleSave={(e) => handleToggleSave(e, p.id)}
                    onOpenPreview={() => setPreviewProperty(p)}
                  />
                ))}
              </div>
            </section>

            {/* Second Section - HCMC Favorites / Premium / Near RMIT */}
            {listings.length > 6 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between pb-3 border-b border-border/60">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-1.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" /> Verified Premium Properties
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">100% verified staff inspects and premium host service</p>
                  </div>
                </div>

                <div className={cn(view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
                  {listings.slice(6).map((p, i) => (
                    <ListingCard 
                      key={p.id} 
                      p={p} 
                      index={i} 
                      view={view}
                      isSaved={savedPropertyIds.includes(p.id)}
                      onToggleSave={(e) => handleToggleSave(e, p.id)}
                      onOpenPreview={() => setPreviewProperty(p)}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      {/* 4. Beautiful Framer Motion Quick Preview Lightbox Modal */}
      <AnimatePresence>
        {previewProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProperty(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-surface ring-1 ring-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row border border-border"
            >
              {/* Close Button */}
              <button 
                onClick={() => setPreviewProperty(null)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background/80 hover:bg-background backdrop-blur grid place-items-center hover:scale-105 transition shadow-sm z-30 cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="h-4.5 w-4.5 text-foreground" />
              </button>

              {/* Left Column: Visuals */}
              <div className="w-full md:w-1/2 relative bg-secondary aspect-video md:aspect-auto overflow-hidden">
                <img 
                  src={previewProperty.images?.[0]?.url || previewProperty.image || heroImg} 
                  alt={previewProperty.title} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {previewProperty.type}
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white line-clamp-2 mt-1">{previewProperty.title}</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1"><MapPin className="h-3 w-3 text-primary-foreground" /> {previewProperty.district || "District 7"}, {previewProperty.city || "HCMC"}</p>
                </div>
              </div>

              {/* Right Column: Description & Application Request form */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[50vh] md:max-h-[85vh] space-y-6 flex flex-col justify-between">
                <div>
                  
                  {/* Rating, landlord & verification details */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-1">
                      <span className="flex items-center gap-0.5 font-bold text-sm">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 
                        {previewProperty.rating || 4.9}
                      </span>
                      <span className="text-xs text-muted-foreground">(24 reviews)</span>
                    </div>
                    {previewProperty.landlord?.status === "ACTIVE" && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Host
                      </span>
                    )}
                  </div>

                  {/* Pricing and specs */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">
                        ${previewProperty.price ?? (previewProperty.rooms?.[0] ? Number(previewProperty.rooms[0].price) : 250)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-2xl border border-border/40">
                      <div className="text-center space-y-1">
                        <Bed className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">{previewProperty.beds ?? 1} Beds</span>
                      </div>
                      <div className="text-center space-y-1 border-x border-border/50">
                        <Bath className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">{previewProperty.baths ?? 1} Bath</span>
                      </div>
                      <div className="text-center space-y-1">
                        <Maximize2 className="h-4 w-4 mx-auto text-primary" />
                        <span className="block font-semibold text-foreground">{previewProperty.area ?? 28} m²</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">About this place</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {previewProperty.description || "Beautiful, sunny living space offering convenient access to local universities, supermarkets, and cafes. Completely furnished with premium beddings, desks, and air-conditioning systems."}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Amenities included</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Verified Host", "Furnished", "High-speed Wi-Fi", "Parking lot", "Air Conditioning"].map((a) => (
                        <span key={a} className="text-[10px] font-medium bg-secondary/60 text-foreground border border-border/40 px-2 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Booking application form */}
                <form 
                  onSubmit={(e) => handleApplyBooking(e, previewProperty)} 
                  className="pt-4 border-t border-border/60 mt-4 space-y-3 bg-secondary/20 p-4 rounded-2xl border border-border/30"
                >
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Apply to Rent this Unit
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="moveIn" className="text-[10px] font-semibold text-muted-foreground block">Proposed Move-in Date</label>
                    <Input 
                      id="moveIn"
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="bg-background border-border/80 rounded-xl h-10 text-xs px-3"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="bookingNote" className="text-[10px] font-semibold text-muted-foreground block">Introductory Message to Host</label>
                    <Input 
                      id="bookingNote"
                      placeholder="Tell the host about your study/work..."
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
                    {bookingMutation.isPending ? "Sending application..." : "Send Rental Request"}
                  </Button>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Beautiful listing card component with motion triggers
function ListingCard({ 
  p, 
  index, 
  view,
  isSaved,
  onToggleSave,
  onOpenPreview 
}: { 
  p: any; 
  index: number; 
  view: "grid" | "list";
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onOpenPreview: () => void;
}) {
  const image = p.images?.[0]?.url || p.image || heroImg;
  const location = `${p.district || "Quận 7"}, ${p.city || "TP. Hồ Chí Minh"}`;
  const price = p.price ?? (p.rooms?.[0] ? Number(p.rooms[0].price) : 250);
  const beds = p.beds ?? (p.rooms?.[0] ? p.rooms[0].capacity : 1);
  const baths = p.baths ?? 1;
  const area = p.area ?? (p.rooms?.[0] ? p.rooms[0].area : 25);
  const rating = p.rating ?? 4.9;
  const isVerified = p.landlord?.status === "ACTIVE" || true;

  if (view === "list") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        onClick={onOpenPreview}
        className="flex flex-col sm:flex-row rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden hover:shadow-elegant transition cursor-pointer select-none group border border-transparent hover:border-border/60"
      >
        <div className="relative w-full sm:w-56 aspect-[4/3] sm:aspect-auto overflow-hidden shrink-0">
          <img src={image} alt={p.title} className="h-full w-full object-cover group-hover:scale-103 transition duration-500" />
          <button 
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition shadow-sm z-20 cursor-pointer"
            onClick={onToggleSave}
            aria-label="Save Property"
          >
            <Heart className={cn("h-4.5 w-4.5 transition-colors", isSaved ? "fill-red-500 text-red-500" : "text-foreground")} />
          </button>
          <div className="absolute top-3 left-3 text-[10px] font-semibold bg-background/90 backdrop-blur px-2 py-0.5 rounded-md text-foreground border border-border/20 uppercase tracking-wide">
            {p.type}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
              <span className="flex items-center gap-0.5 text-xs font-semibold shrink-0"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{rating}</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-primary" />{beds} Beds</span>
            <span className="flex items-center gap-1 border-l border-border pl-4"><Bath className="h-3.5 w-3.5 text-primary" />{baths} Bath</span>
            <span className="flex items-center gap-1 border-l border-border pl-4"><Maximize2 className="h-3.5 w-3.5 text-primary" />{area}m²</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-foreground">${price}</span>
              <span className="text-[10px] text-muted-foreground">/mo</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isVerified && (
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full"><ShieldCheck className="h-3.5 w-3.5" />Verified</span>
              )}
              <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                Quick Apply <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (Standard)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onOpenPreview}
      className="group block rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden hover:shadow-elegant transition cursor-pointer select-none relative hover:-translate-y-0.5 border border-transparent hover:border-border/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img 
          src={image} 
          alt={p.title} 
          className="h-full w-full object-cover group-hover:scale-103 transition duration-500" 
        />
        
        {/* Quick Save button */}
        <button 
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition shadow-sm z-20 cursor-pointer"
          onClick={onToggleSave}
          aria-label="Save Property"
        >
          <Heart className={cn("h-4.5 w-4.5 transition-colors", isSaved ? "fill-red-500 text-red-500" : "text-foreground")} />
        </button>

        {/* Room Type badge */}
        <div className="absolute top-3 left-3 text-[10px] font-semibold bg-background/90 backdrop-blur px-2 py-0.5 rounded-md text-foreground border border-border/20 uppercase tracking-wide">
          {p.type}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
            <span className="flex items-center gap-0.5 text-xs font-semibold shrink-0"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{rating}</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{location}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-primary" />{beds} Beds</span>
          <span className="flex items-center gap-1 border-l border-border pl-3"><Bath className="h-3.5 w-3.5 text-primary" />{baths} Bath</span>
          <span className="flex items-center gap-1 border-l border-border pl-3"><Maximize2 className="h-3.5 w-3.5 text-primary" />{area}m²</span>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/60">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-foreground">${price}</span>
            <span className="text-[10px] text-muted-foreground">/mo</span>
          </div>
          {isVerified ? (
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full"><ShieldCheck className="h-3.5 w-3.5" />Verified</span>
          ) : (
            <span className="text-xs font-semibold text-primary group-hover:underline flex items-center gap-0.5">
              Apply Now <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
