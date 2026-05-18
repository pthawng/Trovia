import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService, PropertyType } from "@/services/property.service";
import { motion } from "motion/react";
import { 
  Building, MapPin, Eye, Plus, ArrowRight, ArrowLeft,
  Settings, Info, Sparkles, Check, Image as ImageIcon, ClipboardList 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/landlord/properties/new")({
  component: NewProperty,
});

function NewProperty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<PropertyType>("BOARDING_HOUSE");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hồ Chí Minh");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [totalFloors, setTotalFloors] = useState(1);
  const [totalUnits, setTotalUnits] = useState(1);
  const [hasParking, setHasParking] = useState(true);
  const [utilities, setUtilities] = useState("Điện: 4,000đ/kWh, Nước: 100,000đ/người/tháng");
  const [rules, setRules] = useState("Giờ giấc tự do, không làm ồn sau 23:00, giữ gìn vệ sinh chung.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetch real seeded amenities
  const { data: amenities = [] } = useQuery({
    queryKey: ["allSystemAmenities"],
    queryFn: () => PropertyService.getAmenities(),
  });

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const createMutation = useMutation({
    mutationFn: (dto: any) => PropertyService.create(dto),
    onSuccess: (newProp) => {
      toast.success("Bản nháp bất động sản đã được tạo thành công!");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      // Redirect to detailed view to add units/rooms and publish
      navigate({ to: `/app/landlord/properties/${newProp.id}` as any });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi trong quá trình tạo bất động sản.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng điền tiêu đề bất động sản.");
      return;
    }
    if (!address.trim() || !district.trim() || !ward.trim()) {
      toast.error("Vui lòng điền đầy đủ địa chỉ chi tiết.");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Vui lòng tải lên hoặc điền liên kết hình ảnh.");
      return;
    }

    createMutation.mutate({
      title,
      description: description || "Không có mô tả chi tiết.",
      address,
      city,
      district,
      ward,
      type,
      totalFloors: Number(totalFloors),
      totalUnits: Number(totalUnits),
      hasParking,
      utilities,
      rules,
      images: [imageUrl],
      amenities: selectedAmenities,
      status: "DRAFT", // Start as draft as per landlord lifecycle
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-12">
      {/* Header and Go back */}
      <div className="space-y-4">
        <Link 
          to="/app/landlord/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách bất động sản
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-[oklch(0.55_0.2_285)] bg-clip-text text-transparent">
            Thêm bất động sản mới
          </h1>
          <p className="text-muted-foreground text-sm">
            Tạo bản nháp, điền thông tin mô tả chi tiết và cấu hình tiện ích của tòa nhà.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left main form section */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Thông tin cơ bản */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 mb-1 border-b border-border/60">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prop-title">Tiêu đề bất động sản</Label>
                <Input 
                  id="prop-title"
                  className="h-11"
                  placeholder="e.g. Căn hộ dịch vụ cao cấp Quận 1 view Landmark"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-type">Loại hình bất động sản</Label>
                  <select 
                    id="prop-type"
                    className="flex h-11 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                  >
                    <option value="BOARDING_HOUSE">Nhà trọ / Phòng trọ bình dân</option>
                    <option value="APARTMENT">Căn hộ chung cư</option>
                    <option value="HOUSE">Nhà nguyên căn</option>
                    <option value="STUDIO">Phòng Studio dịch vụ</option>
                    <option value="DORMITORY">Ký túc xá / Homestay</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prop-image">Hình ảnh đại diện (URL)</Label>
                  <Input 
                    id="prop-image"
                    className="h-11"
                    placeholder="Đường dẫn ảnh Unsplash hoặc ảnh thực tế"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prop-desc">Mô tả chi tiết</Label>
                <Textarea 
                  id="prop-desc"
                  className="min-h-32"
                  placeholder="Giới thiệu chi tiết về khu vực xung quanh, khoảng cách đến trường học/chợ, giờ giấc sinh hoạt và các ưu đãi đặc biệt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vị trí địa lý */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 mb-1 border-b border-border/60">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">Địa chỉ & Vị trí</h3>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-city">Tỉnh / Thành phố</Label>
                  <Input id="prop-city" className="h-11" value={city} disabled readOnly required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-dist">Quận / Huyện</Label>
                  <Input 
                    id="prop-dist" 
                    className="h-11" 
                    placeholder="e.g. Bình Thạnh" 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-ward">Phường / Xã</Label>
                  <Input 
                    id="prop-ward" 
                    className="h-11" 
                    placeholder="e.g. Phường 25" 
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prop-address">Địa chỉ chi tiết (Số nhà, tên đường)</Label>
                <Input 
                  id="prop-address" 
                  className="h-11" 
                  placeholder="e.g. 456 Điện Biên Phủ" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Cấu hình quy định & Tiện ích bổ sung */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 mb-1 border-b border-border/60">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">Chi phí dịch vụ & Nội quy</h3>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-floors">Số tầng</Label>
                  <Input 
                    id="prop-floors" 
                    type="number"
                    min={1}
                    className="h-11" 
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-units">Số lượng phòng/căn hộ</Label>
                  <Input 
                    id="prop-units" 
                    type="number"
                    min={1}
                    className="h-11" 
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                    required 
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={hasParking}
                      onChange={(e) => setHasParking(e.target.checked)}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">Có chỗ để xe máy/ô tô</span>
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prop-utils">Biểu phí dịch vụ tiện ích</Label>
                  <Input 
                    id="prop-utils" 
                    className="h-11" 
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prop-rules">Nội quy sinh hoạt</Label>
                  <Input 
                    id="prop-rules" 
                    className="h-11" 
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: Choose Amenities and submit */}
        <div className="space-y-6">
          {/* Amenities Card */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Tiện ích tòa nhà
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chọn các dịch vụ, trang thiết bị chung sẵn có tại bất động sản này.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {amenities.map((a: any) => {
                const isSelected = selectedAmenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(a.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                      isSelected 
                        ? "border-primary bg-primary-soft text-primary" 
                        : "border-border hover:bg-secondary/40 text-foreground"
                    }`}
                  >
                    <div className={`h-4.5 w-4.5 rounded-md grid place-items-center border shrink-0 ${
                      isSelected ? "bg-primary text-white border-transparent" : "border-border bg-surface"
                    }`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="truncate">{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action sticky card */}
          <div className="rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-[var(--shadow-elegant)] border border-border space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-primary" /> Đăng tin & Xuất bản
            </h3>
            
            <p className="text-xs text-muted-foreground leading-normal">
              Bất động sản mới được tạo sẽ nằm ở trạng thái **Bản nháp (DRAFT)**. Bạn cần thêm ít nhất một phòng/căn hộ khả dụng trước khi có thể xuất bản công khai.
            </p>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                {createMutation.isPending ? "Đang khởi tạo..." : "Lưu bản nháp & Tiếp tục"} 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
