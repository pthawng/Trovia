import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { RoomService } from "@/services/room.service";
import { motion } from "motion/react";
import { 
  Building, MapPin, Eye, Plus, ArrowRight, ArrowLeft,
  Settings, Info, Sparkles, Check, Trash2, Edit3, Save, X, Bed, Layers, DollarSign, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/landlord/units/$id")({
  component: UnitDetail,
});

function UnitDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form states
  const [title, setTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [deposit, setDeposit] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [status, setStatus] = useState("AVAILABLE");
  const [genderRestriction, setGenderRestriction] = useState("ANY");

  // Load parent property and matching room
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["landlordProperties"],
    queryFn: () => PropertyService.findMyProperties(),
  });

  const parentProperty = properties.find((p: any) => p.rooms?.some((r: any) => r.id === id));
  const room = parentProperty?.rooms?.find((r: any) => r.id === id);

  // Sync form inputs when room data is resolved
  useEffect(() => {
    if (room) {
      setTitle(room.title || "");
      setRoomNumber(room.roomNumber || "");
      setPrice(room.price?.toString() || "");
      setArea(room.area?.toString() || "");
      setDeposit(room.deposit?.toString() || "");
      setFloor(room.floor?.toString() || "");
      setCapacity(room.capacity?.toString() || "");
      setDescription(room.description || "");
      setIsAvailable(room.isAvailable ?? true);
      setStatus(room.status || "AVAILABLE");
      setGenderRestriction(room.genderRestriction || "ANY");
    }
  }, [room]);

  const updateMutation = useMutation({
    mutationFn: (dto: any) => RoomService.update(id, dto),
    onSuccess: () => {
      toast.success("Cập nhật thông tin phòng thành công!");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      if (parentProperty) {
        queryClient.invalidateQueries({ queryKey: ["propertyDetail", parentProperty.id] });
        navigate({ to: "/app/landlord/properties/$id", params: { id: parentProperty.id } });
      } else {
        navigate({ to: "/app/landlord/properties" });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể lưu cập nhật.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => RoomService.delete(id),
    onSuccess: () => {
      toast.success("Đã xóa phòng trọ khỏi hệ thống!");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      if (parentProperty) {
        queryClient.invalidateQueries({ queryKey: ["propertyDetail", parentProperty.id] });
        navigate({ to: "/app/landlord/properties/$id", params: { id: parentProperty.id } });
      } else {
        navigate({ to: "/app/landlord/properties" });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi xóa phòng.");
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-80 bg-muted rounded-3xl" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <h2 className="text-xl font-bold">Không tìm thấy phòng trọ này</h2>
        <Button asChild className="rounded-xl">
          <Link to="/app/landlord/properties">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !area || !deposit || !capacity) {
      toast.error("Vui lòng nhập đầy đủ các thông tin phòng bắt buộc.");
      return;
    }

    updateMutation.mutate({
      title,
      roomNumber: roomNumber || undefined,
      price: Number(price),
      area: Number(area),
      deposit: Number(deposit),
      floor: floor ? Number(floor) : undefined,
      capacity: Number(capacity),
      description: description || undefined,
      isAvailable,
      status,
      genderRestriction,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6 pb-12">
      {/* Top Breadcrumb navigation */}
      <div className="space-y-4">
        {parentProperty && (
          <Link 
            to="/app/landlord/properties/$id"
            params={{ id: parentProperty.id }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại tòa nhà {parentProperty.title}
          </Link>
        )}
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-[oklch(0.55_0.2_285)] bg-clip-text text-transparent">
            Thiết lập phòng / căn hộ chi tiết
          </h1>
          <p className="text-muted-foreground text-sm">
            {room.title} {room.roomNumber && `(#${room.roomNumber})`} • Cập nhật giá cả và trạng thái khả dụng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8 items-start">
        {/* Main form (2 cols) */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 mb-1 border-b border-border/60">
            <Bed className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground font-semibold">Thông tin phòng trọ</h3>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Tên hiển thị (Bắt buộc)</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="roomNumber">Số phòng</Label>
                <Input id="roomNumber" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Giá thuê / tháng (VND)</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deposit">Tiền đặt cọc (VND)</Label>
                <Input id="deposit" type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="area">Diện tích (m²)</Label>
                <Input id="area" type="number" value={area} onChange={(e) => setArea(e.target.value)} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="floor">Tầng số</Label>
                <Input id="floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Sức chứa tối đa (người)</Label>
                <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Giới hạn giới tính</Label>
                <select 
                  id="gender"
                  className="flex h-11 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none"
                  value={genderRestriction}
                  onChange={(e) => setGenderRestriction(e.target.value)}
                >
                  <option value="ANY">Tất cả (Nam / Nữ)</option>
                  <option value="MALE_ONLY">Chỉ Nam</option>
                  <option value="FEMALE_ONLY">Chỉ Nữ</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Mô tả phòng chi tiết</Label>
              <Textarea id="desc" className="min-h-28" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Right sidebar options & controls */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-primary" /> Trạng thái phòng trọ
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cập nhật khả năng tìm kiếm phòng của khách thuê.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">Còn trống (Khả dụng)</span>
                  <span className="text-[10px] text-muted-foreground">Có thể đặt thuê trực tiếp.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => {
                    const avail = e.target.checked;
                    setIsAvailable(avail);
                    setStatus(avail ? "AVAILABLE" : "RENTED");
                  }}
                  className="h-5 w-5 rounded border-border text-primary cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 border-t border-border pt-4">
                <Label htmlFor="status">Trạng thái chi tiết</Label>
                <select 
                  id="status"
                  className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-xs focus-visible:outline-none"
                  value={status}
                  onChange={(e) => {
                    const st = e.target.value;
                    setStatus(st);
                    setIsAvailable(st === "AVAILABLE");
                  }}
                >
                  <option value="AVAILABLE">Còn trống (AVAILABLE)</option>
                  <option value="RENTED">Đã cho thuê (RENTED)</option>
                  <option value="MAINTENANCE">Đang sửa chữa (MAINTENANCE)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <Button type="submit" disabled={updateMutation.isPending} className="w-full h-11 text-xs font-bold rounded-xl gap-1.5">
                <Save className="h-4 w-4" /> Lưu thông tin
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa phòng trọ này?")) {
                    deleteMutation.mutate();
                  }
                }}
                variant="outline"
                className="w-full h-11 text-xs font-bold rounded-xl gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="h-4 w-4" /> Xóa phòng trọ
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
