import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Star, MapPin, Bed, Bath, Maximize2, ShieldCheck, Heart, Share2, Calendar, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { SavedPropertyService } from "@/services/saved-property.service";
import { BookingRequestService } from "@/services/booking-request.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/hero-apartment.jpg";

export const Route = createFileRoute("/_authenticated/app/property/$id")({ component: PropertyDetail });

function PropertyDetail() {
  const { id } = useParams({ from: "/_authenticated/app/property/$id" });
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const serviceFee = 100000; // 100,000 VND standard service fee

  // Booking Request State
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [moveInDate, setMoveInDate] = useState<string>("");
  const [bookingNote, setBookingNote] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // 1. Fetch Property Details
  const { data: p, isLoading, error } = useQuery({
    queryKey: ["propertyDetail", id],
    queryFn: () => PropertyService.findOne(id),
  });

  // 2. Saved list query to check favorite status
  const { data: savedList = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => SavedPropertyService.getSavedListings(),
  });

  const isSaved = savedList.some((x) => x.id === id);

  // 3. Save / Unsave Mutations
  const toggleSaveMutation = useMutation<any, any, void>({
    mutationFn: () => {
      if (isSaved) {
        return SavedPropertyService.unsave(id);
      } else {
        return SavedPropertyService.save(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedProperties"] });
      toast.success(isSaved ? t("property.favorite_removed") : t("property.favorite_added"));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("common.error"));
    },
  });

  // 4. Create Booking Request Mutation
  const createBookingMutation = useMutation({
    mutationFn: (dto: { propertyId: string; roomId: string; proposedMoveInDate: string; note: string }) =>
      BookingRequestService.create(dto),
    onSuccess: () => {
      toast.success(t("common.success"));
      setIsDialogOpen(false);
      setBookingNote("");
      setMoveInDate("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("common.error"));
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error("Please select a room to rent.");
      return;
    }
    if (!moveInDate) {
      toast.error("Please specify a proposed move-in date.");
      return;
    }

    createBookingMutation.mutate({
      propertyId: id,
      roomId: selectedRoomId,
      proposedMoveInDate: new Date(moveInDate).toISOString(),
      note: bookingNote,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl space-y-6 py-12 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-3xl" />
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 space-y-6">
            <div className="h-10 w-2/3 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
          <div className="h-80 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="max-w-7xl text-center py-20">
        <h2 className="text-2xl font-semibold">{t("property.not_found")}</h2>
        <p className="text-muted-foreground mt-2">{t("property.not_found_desc")}</p>
        <Button className="mt-6" asChild>
          <Link to="/app/explore">{t("property.back_to_explore")}</Link>
        </Button>
      </div>
    );
  }

  const mainImage = p.images?.[0]?.url || heroImg;
  const location = `${p.address ? p.address + ", " : ""}${p.district}, ${p.city}`;
  
  // Amenities mapping
  const amenitiesList: string[] = p.propertyAmenities?.map((pa) => pa.amenity.name) || [];
  
  // Landlord details mapping
  const landlordName = p.landlord?.user?.fullName || "Trovia Landlord";
  const landlordInitials = landlordName.slice(0, 2).toUpperCase();
  const isLandlordActive = (p.landlord as any)?.status === "ACTIVE";

  const rooms = p.rooms || [];
  const defaultRoom = rooms[0];

  return (
    <div className="max-w-7xl space-y-8">
      <Link to="/app/explore" className="text-sm text-muted-foreground hover:text-foreground">← {t("property.back_to_explore")}</Link>

      {/* Media Grid */}
      <div className="grid lg:grid-cols-4 gap-3 h-[420px]">
        <div className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden">
          <img src={mainImage} alt={p.title} className="h-full w-full object-cover" />
        </div>
        {p.images?.slice(1, 5).map((img, i) => (
          <div key={img.id || i} className="rounded-2xl overflow-hidden hidden lg:block">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        {(!p.images || p.images.length <= 1) && (
          <>
            <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={mainImage} alt="" className="h-full w-full object-cover" /></div>
            <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={mainImage} alt="" className="h-full w-full object-cover" /></div>
            <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={mainImage} alt="" className="h-full w-full object-cover" /></div>
            <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={mainImage} alt="" className="h-full w-full object-cover" /></div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Core details column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-2"><MapPin className="h-4 w-4" />{location}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={isSaved ? "text-red-500 bg-red-50" : ""}
                  onClick={() => toggleSaveMutation.mutate()}
                  disabled={toggleSaveMutation.isPending}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-amber-500" />4.9 · 18 reviews</span>
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{defaultRoom?.capacity || 1} {t("property.capacity").toLowerCase()}</span>
              <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" />{defaultRoom?.area || 30} m² {t("landlord.room_size").split(" ")[0].toLowerCase()}</span>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-3">{t("property.description")}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{p.description}</p>
          </div>

          {/* Rooms Selector */}
          {rooms.length > 0 && (
            <div className="border-t border-border pt-8">
              <h2 className="text-xl font-semibold mb-4">{t("property.rooms_available")}</h2>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} 
                    className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 transition-all ${
                      selectedRoomId === room.id 
                        ? "border-primary bg-primary-soft/30 ring-1 ring-primary" 
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-base">{room.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{room.description || "Move-in ready room package."}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>{t("landlord.room_size")}: {room.area}m²</span>
                        <span>{t("property.capacity")}: {room.capacity}</span>
                        <span>{t("property.deposit")}: {Number(room.deposit).toLocaleString('vi-VN')} VND</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{Number(room.price).toLocaleString('vi-VN')} VND</div>
                        <div className="text-xs text-muted-foreground">/ {t("property.price_per_month").toLowerCase()}</div>
                      </div>
                      <Button 
                        variant={selectedRoomId === room.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          if (defaultRoom) {
                            setMoveInDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                          }
                        }}
                      >
                        {selectedRoomId === room.id ? <Check className="h-4 w-4" /> : t("common.select")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">{t("property.amenities")}</h2>
            {amenitiesList.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("property.no_amenities")}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {amenitiesList.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">{t("property.about_landlord")}</h2>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white font-semibold">
                {landlordInitials}
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {landlordName}
                  {isLandlordActive && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />{t("property.verified_landlord")}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{t("property.landlord_response")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Booking Card Sidebar */}
        <aside>
          <div className="sticky top-24 rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-[var(--shadow-elegant)]">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">
                {defaultRoom ? Number(defaultRoom.price).toLocaleString('vi-VN') + " VND" : "—"}
              </span>
              <span className="text-muted-foreground">/ {t("property.price_per_month").toLowerCase()}</span>
            </div>
            
            <div className="mt-6 space-y-3">
              {/* Dialog for booking request */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12" disabled={rooms.length === 0}>
                    {t("property.request_rent")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t("property.request_rent")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="dialog-room">{t("booking.room_info")}</Label>
                      <select 
                        id="dialog-room"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        required
                      >
                        <option value="">{t("property.select_room_placeholder")}</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title} - {Number(r.price).toLocaleString('vi-VN')} VND / {t("common.month") || "tháng"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dialog-date">{t("property.move_in_date")}</Label>
                      <Input
                        id="dialog-date"
                        type="date"
                        value={moveInDate}
                        onChange={(e) => setMoveInDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dialog-note">{t("property.note")}</Label>
                      <Textarea
                        id="dialog-note"
                        placeholder={t("property.note_placeholder")}
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full h-11 mt-4" disabled={createBookingMutation.isPending}>
                      {createBookingMutation.isPending ? t("common.loading") : t("property.request_rent")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full h-12 gap-2">
                <Calendar className="h-4 w-4" />{t("property.book_tour")}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center mt-3">{t("property.no_charge_yet")}</div>
            
            <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("property.deposit")}</span>
                <span>{defaultRoom ? Number(defaultRoom.deposit).toLocaleString('vi-VN') + " VND" : "0 VND"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("property.service_fee")}</span>
                <span>{serviceFee.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span>{t("property.move_in_total")}</span>
                <span>
                  {defaultRoom ? (Number(defaultRoom.price) + Number(defaultRoom.deposit) + serviceFee).toLocaleString('vi-VN') + " VND" : "0 VND"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
