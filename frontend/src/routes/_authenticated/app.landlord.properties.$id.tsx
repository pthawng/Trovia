import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { RoomService } from "@/services/room.service";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, MapPin, Eye, Plus, ArrowRight, ArrowLeft,
  Settings, Info, Sparkles, Check, Image as ImageIcon, ClipboardList,
  Flame, LayoutGrid, CheckCircle2, AlertTriangle, XCircle, Trash2, Edit3, Save, X, Bed, Layers, DollarSign, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/landlord/properties/$id")({
  component: PropertyDetail,
});

function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { landlordProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Edit property states
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAddr, setEditAddr] = useState("");
  const [editDist, setEditDist] = useState("");
  const [editWard, setEditWard] = useState("");
  const [editType, setEditType] = useState<any>("BOARDING_HOUSE");
  const [editFloors, setEditFloors] = useState(1);
  const [editUnits, setEditUnits] = useState(1);
  const [editHasParking, setEditHasParking] = useState(true);
  const [editUtils, setEditUtils] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editAmenities, setEditAmenities] = useState<string[]>([]);

  // Add Room states
  const [roomTitle, setRoomTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomArea, setRoomArea] = useState("");
  const [roomDeposit, setRoomDeposit] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomDesc, setRoomDesc] = useState("");

  // Query: Property details
  const { data: property, isLoading, error } = useQuery({
    queryKey: ["propertyDetail", id],
    queryFn: async () => {
      const data = await PropertyService.findOne(id);
      // Initialize edit fields when data arrives
      setEditTitle(data.title || "");
      setEditDesc(data.description || "");
      setEditAddr(data.address || "");
      setEditDist(data.district || "");
      setEditWard(data.ward || "");
      setEditType(data.type || "BOARDING_HOUSE");
      setEditFloors(data.totalFloors || 1);
      setEditUnits(data.totalUnits || 1);
      setEditHasParking(data.hasParking ?? true);
      setEditUtils(data.utilities || "");
      setEditRules(data.rules || "");
      setEditImage(data.images?.[0]?.url || "");
      setEditAmenities(data.propertyAmenities?.map((pa: any) => pa.amenityId) || []);
      return data;
    },
  });

  // Query: All system amenities
  const { data: amenities = [] } = useQuery({
    queryKey: ["allSystemAmenities"],
    queryFn: () => PropertyService.getAmenities(),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (dto: any) => PropertyService.update(id, dto),
    onSuccess: () => {
      toast.success(t("property.detail.toasts.update_success"));
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["propertyDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("property.detail.toasts.update_error"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => PropertyService.delete(id),
    onSuccess: () => {
      toast.success(t("property.detail.toasts.delete_success"));
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      navigate({ to: "/app/landlord/properties" as any });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("property.detail.toasts.delete_error"));
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => PropertyService.publish(id),
    onSuccess: () => {
      toast.success(t("property.detail.toasts.publish_success"));
      queryClient.invalidateQueries({ queryKey: ["propertyDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("property.detail.toasts.publish_error"));
    }
  });

  const addRoomMutation = useMutation({
    mutationFn: (dto: any) => RoomService.create(id, dto),
    onSuccess: () => {
      toast.success(t("property.detail.toasts.add_room_success"));
      setIsAddRoomOpen(false);
      // Reset form
      setRoomTitle("");
      setRoomNumber("");
      setRoomPrice("");
      setRoomArea("");
      setRoomDeposit("");
      setRoomFloor("");
      setRoomCapacity("");
      setRoomDesc("");
      
      queryClient.invalidateQueries({ queryKey: ["propertyDetail", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("property.detail.toasts.add_room_error"));
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (roomId: string) => RoomService.delete(roomId),
    onSuccess: () => {
      toast.success(t("property.detail.toasts.delete_room_success"));
      queryClient.invalidateQueries({ queryKey: ["propertyDetail", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("property.detail.toasts.delete_room_error"));
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-muted rounded-3xl" />
          <div className="h-80 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">{t("property.not_found")}</h2>
        <Button asChild className="rounded-xl">
          <Link to="/app/landlord/properties">{t("property.detail.back_to_list")}</Link>
        </Button>
      </div>
    );
  }

  // Publishing verification checklist
  const checkLandlord = landlordProfile?.status === "ACTIVE";
  const checkAddress = !!(property.address && property.city && property.district);
  const checkImage = (property.images?.length || 0) > 0;
  const checkAmenity = (property.propertyAmenities?.length || 0) > 0;
  const checkRoomAvailable = property.rooms?.some((r: any) => r.isAvailable && r.status === "AVAILABLE");

  const canPublish = checkLandlord && checkAddress && checkImage && checkAmenity && checkRoomAvailable;

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title: editTitle,
      description: editDesc,
      address: editAddr,
      city: property.city,
      district: editDist,
      ward: editWard,
      type: editType,
      totalFloors: Number(editFloors),
      totalUnits: Number(editUnits),
      hasParking: editHasParking,
      utilities: editUtils,
      rules: editRules,
      images: editImage ? [editImage] : [],
      amenities: editAmenities,
    });
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle.trim() || !roomPrice || !roomArea || !roomDeposit || !roomCapacity) {
      toast.error(t("property.detail.toasts.fill_required_room"));
      return;
    }

    addRoomMutation.mutate({
      title: roomTitle,
      roomNumber: roomNumber || undefined,
      price: Number(roomPrice),
      area: Number(roomArea),
      deposit: Number(roomDeposit),
      floor: roomFloor ? Number(roomFloor) : undefined,
      capacity: Number(roomCapacity),
      description: roomDesc || undefined,
      isAvailable: true,
      status: "AVAILABLE",
    });
  };

  const toggleEditAmenity = (amenityId: string) => {
    setEditAmenities(prev =>
      prev.includes(amenityId) ? prev.filter(id => id !== amenityId) : [...prev, amenityId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 pb-16">
      
      {/* Top Navigation & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link 
          to="/app/landlord/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("property.detail.back_to_list")}
        </Link>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                className="rounded-xl h-10 gap-1.5 border-border hover:bg-secondary/40 text-foreground font-semibold"
              >
                <Edit3 className="h-4 w-4" /> {t("property.detail.edit_info")}
              </Button>
              <Button 
                onClick={() => {
                  if (confirm(t("property.detail.confirm_delete_prop"))) {
                    deleteMutation.mutate();
                  }
                }} 
                variant="outline" 
                className="rounded-xl h-10 gap-1.5 border-destructive/20 hover:bg-destructive/10 text-destructive font-semibold"
              >
                <Trash2 className="h-4 w-4" /> {t("property.detail.delete")}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        
        {/* Main Console Section (2 cols) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Card: Property details/Edit mode */}
          <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-sm">
            
            {/* Visual Image Banner */}
            <div className="relative aspect-[2] bg-muted overflow-hidden">
              <img 
                src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"} 
                alt={property.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                  property.status === "PUBLISHED" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {property.status === "PUBLISHED" ? t("property.detail.published_status") : t("property.detail.draft_status")}
                </span>
                
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-secondary/80 text-foreground border border-border backdrop-blur-md">
                  {t("property.types." + property.type)}
                </span>
              </div>
            </div>

            {/* Editing and reading panels */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form 
                    key="edit-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleUpdateSubmit} 
                    className="space-y-5"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-border">
                      <h3 className="font-bold text-base">{t("property.detail.edit_title")}</h3>
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>{t("property.detail.prop_title")}</Label>
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.prop_type")}</Label>
                          <select 
                            className="flex h-11 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                          >
                            <option value="BOARDING_HOUSE">{t("property.types.BOARDING_HOUSE")}</option>
                            <option value="APARTMENT">{t("property.types.APARTMENT")}</option>
                            <option value="HOUSE">{t("property.types.HOUSE")}</option>
                            <option value="STUDIO">{t("property.types.STUDIO")}</option>
                            <option value="DORMITORY">{t("property.types.DORMITORY")}</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.prop_image")}</Label>
                          <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} required />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.district")}</Label>
                          <Input value={editDist} onChange={(e) => setEditDist(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.ward")}</Label>
                          <Input value={editWard} onChange={(e) => setEditWard(e.target.value)} required />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>{t("property.detail.detailed_address")}</Label>
                        <Input value={editAddr} onChange={(e) => setEditAddr(e.target.value)} required />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.total_floors")}</Label>
                          <Input type="number" min={1} value={editFloors} onChange={(e) => setEditFloors(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.total_rooms")}</Label>
                          <Input type="number" min={1} value={editUnits} onChange={(e) => setEditUnits(Number(e.target.value))} required />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end pb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={editHasParking}
                              onChange={(e) => setEditHasParking(e.target.checked)}
                              className="h-5 w-5 rounded border-border"
                            />
                            <span className="text-xs font-semibold">{t("property.detail.has_parking")}</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.utilities_rules")}</Label>
                          <Input value={editUtils} onChange={(e) => setEditUtils(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>{t("property.detail.house_rules")}</Label>
                          <Input value={editRules} onChange={(e) => setEditRules(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>{t("property.detail.description")}</Label>
                        <Textarea className="min-h-24" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label className="block">{t("property.detail.building_amenities")}</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {amenities.map((a: any) => {
                            const selected = editAmenities.includes(a.id);
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => toggleEditAmenity(a.id)}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${
                                  selected ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-secondary/40"
                                }`}
                              >
                                <span className="truncate">{a.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={updateMutation.isPending} className="rounded-xl h-10 px-6 gap-1.5">
                        <Save className="h-4 w-4" /> {t("property.detail.save_changes")}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl h-10 px-6">
                        {t("property.detail.cancel")}
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="read-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{property.title}</h2>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{property.address}, {property.ward}, {property.district}, {property.city}</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 border-t border-b border-border/60 py-5 text-sm">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">{t("property.detail.specs_title")}</span>
                          <span className="font-bold text-foreground mt-1 block">
                            {t("property.detail.specs_desc", { 
                              floors: property.totalFloors, 
                              rooms: property.totalUnits, 
                              parking: property.hasParking ? t("property.detail.parking_yes") : t("property.detail.parking_no") 
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">{t("property.detail.desc_title")}</span>
                          <p className="text-foreground text-xs leading-relaxed mt-1 text-justify">
                            {property.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">{t("property.detail.utilities_title")}</span>
                          <span className="font-bold text-foreground text-xs mt-1 block">
                            {property.utilities || t("property.detail.utilities_fallback")}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium uppercase tracking-wider">{t("property.detail.rules_title")}</span>
                          <span className="font-bold text-foreground text-xs mt-1 block">
                            {property.rules || t("property.detail.rules_fallback")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">{t("property.detail.amenities_title")}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {property.propertyAmenities?.map((pa: any) => (
                          <span key={pa.id} className="text-[10px] font-bold bg-secondary/70 text-foreground border border-border/40 px-3 py-1 rounded-full shadow-sm">
                            {pa.amenity?.name || t("property.detail.amenity_fallback")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section: Rooms / Units registration */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">{t("property.detail.room_list_title")}</h3>
              </div>
              
              <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl h-9 text-xs font-bold gap-1 shadow-sm bg-primary text-primary-foreground hover:bg-primary/95">
                    <Plus className="h-3.5 w-3.5" /> {t("property.detail.add_room_btn")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-3xl bg-surface p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold">{t("property.detail.add_room_modal_title")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="room-name">{t("property.detail.room_name_label")}</Label>
                        <Input id="room-name" placeholder="e.g. Phòng 101 - Lầu 1" value={roomTitle} onChange={(e) => setRoomTitle(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="room-num">{t("property.detail.room_number_label")}</Label>
                        <Input id="room-num" placeholder="e.g. 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="room-price">{t("property.detail.room_price_label")}</Label>
                        <Input id="room-price" type="number" placeholder="e.g. 3500000" value={roomPrice} onChange={(e) => setRoomPrice(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="room-dep">{t("property.detail.room_deposit_label")}</Label>
                        <Input id="room-dep" type="number" placeholder="e.g. 3500000" value={roomDeposit} onChange={(e) => setRoomDeposit(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="room-area">{t("property.detail.room_area_label")}</Label>
                        <Input id="room-area" type="number" placeholder="e.g. 20" value={roomArea} onChange={(e) => setRoomArea(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="room-floor">{t("property.detail.room_floor_label")}</Label>
                        <Input id="room-floor" type="number" placeholder="e.g. 1" value={roomFloor} onChange={(e) => setRoomFloor(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="room-cap">{t("property.detail.room_capacity_label")}</Label>
                        <Input id="room-cap" type="number" placeholder="e.g. 2" value={roomCapacity} onChange={(e) => setRoomCapacity(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="room-desc">{t("property.detail.room_desc_label")}</Label>
                      <Textarea id="room-desc" placeholder={t("property.detail.room_desc_placeholder")} value={roomDesc} onChange={(e) => setRoomDesc(e.target.value)} />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button type="submit" disabled={addRoomMutation.isPending} className="rounded-xl h-10 px-6 font-bold">
                        {addRoomMutation.isPending ? t("property.detail.publishing_loading") : t("property.detail.room_create_btn")}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddRoomOpen(false)} className="rounded-xl h-10 px-6">
                        {t("property.detail.cancel")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {(!property.rooms || property.rooms.length === 0) ? (
              <div className="text-center py-10 bg-secondary/10 rounded-2xl border border-dashed border-border/80 space-y-2">
                <Bed className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold">{t("property.detail.no_rooms_title")}</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {t("property.detail.no_rooms_desc")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                      <th className="py-3 px-4">{t("property.detail.table.name")}</th>
                      <th className="py-3 px-4">{t("property.detail.table.price")}</th>
                      <th className="py-3 px-4">{t("property.detail.table.area")}</th>
                      <th className="py-3 px-4">{t("property.detail.table.capacity")}</th>
                      <th className="py-3 px-4">{t("property.detail.table.status")}</th>
                      <th className="py-3 px-4 text-right">{t("property.detail.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.rooms.map((room: any) => (
                      <tr key={room.id} className="border-b border-border/60 hover:bg-secondary/20 transition">
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {room.title} {room.roomNumber && `(#${room.roomNumber})`}
                        </td>
                        <td className="py-3.5 px-4 text-foreground font-semibold">
                          {room.price.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3.5 px-4 font-medium">{room.area} m²</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{t("property.detail.table.capacity_text", { count: room.capacity })}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            room.isAvailable && room.status === "AVAILABLE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {room.isAvailable && room.status === "AVAILABLE" ? t("property.detail.table.available") : t("property.detail.table.rented")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button 
                            onClick={() => {
                              if (confirm(t("property.detail.confirm_delete_room", { title: room.title }))) {
                                deleteRoomMutation.mutate(room.id);
                              }
                            }}
                            variant="ghost" 
                            className="rounded-xl h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar publishing validation (1 col) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-surface border border-border p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                <Flame className="h-4.5 w-4.5 text-primary animate-pulse" /> {t("property.detail.publish_box_title")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("property.detail.publish_box_desc")}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex items-start gap-2.5">
                {checkLandlord ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${checkLandlord ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("property.detail.checklist.landlord_active")}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{t("property.detail.checklist.landlord_active_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkAddress ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${checkAddress ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("property.detail.checklist.address_provided")}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{t("property.detail.checklist.address_provided_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkImage ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${checkImage ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("property.detail.checklist.image_uploaded")}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{t("property.detail.checklist.image_uploaded_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkAmenity ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${checkAmenity ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("property.detail.checklist.amenity_provided")}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{t("property.detail.checklist.amenity_provided_desc")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {checkRoomAvailable ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-semibold ${checkRoomAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                    {t("property.detail.checklist.room_available")}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{t("property.detail.checklist.room_available_desc")}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4">
              {property.status === "PUBLISHED" ? (
                <div className="p-3.5 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" /> {t("property.detail.published_box_badge")}
                </div>
              ) : (
                <Button 
                  onClick={() => publishMutation.mutate()}
                  disabled={!canPublish || publishMutation.isPending}
                  className={`w-full h-11 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                    canPublish 
                      ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {publishMutation.isPending ? t("property.detail.publishing_loading") : t("property.detail.publish_action_btn")}
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
