import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { motion } from "motion/react";
import { 
  Building, MapPin, Eye, Plus, ArrowRight, CheckCircle2, 
  Layers, Badge, Sparkles, AlertCircle, Home, Hammer 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/landlord/properties")({
  component: LandlordProperties,
});

function LandlordProperties() {
  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["landlordProperties"],
    queryFn: () => PropertyService.findMyProperties(),
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-muted rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-[oklch(0.55_0.2_285)] bg-clip-text text-transparent">
            Bất động sản của tôi
          </h1>
          <p className="text-muted-foreground text-sm">
            Quản lý, chỉnh sửa và đăng tin cho thuê các tòa nhà và căn hộ của bạn.
          </p>
        </div>

        <Button asChild className="rounded-xl h-11 gap-1.5 shadow-sm bg-primary hover:bg-primary/95 text-white">
          <Link to="/app/landlord/properties/new">
            <Plus className="h-4 w-4" /> Thêm bất động sản mới
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-16 text-center space-y-4 max-w-xl mx-auto">
          <div className="h-16 w-16 bg-primary-soft text-primary rounded-2xl grid place-items-center mx-auto">
            <Home className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Chưa có bất động sản nào</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Bắt đầu tạo hồ sơ bất động sản đầu tiên của bạn để thêm phòng và đăng tin cho thuê trên thị trường Trovia.
            </p>
          </div>
          <Button asChild className="rounded-xl px-6">
            <Link to="/app/landlord/properties/new">Thêm ngay bất động sản</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const defaultImage = p.images?.[0]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
            const totalRooms = p.rooms?.length || 0;
            const availableRooms = p.rooms?.filter((r) => r.isAvailable).length || 0;

            return (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-3xl border border-border bg-surface overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full"
              >
                {/* Visual Image cover */}
                <div className="relative aspect-[1.6] bg-muted overflow-hidden">
                  <img 
                    src={defaultImage} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                      p.status === "PUBLISHED" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : p.status === "DRAFT" 
                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {p.status === "PUBLISHED" ? "ĐANG ĐĂNG TIN" : "BẢN NHÁP"}
                    </span>
                  </div>
                </div>

                {/* Content info card */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition line-clamp-1">
                      {p.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="line-clamp-1">{p.address}, {p.district}, {p.city}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-3.5 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Loại hình</span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {p.type === "BOARDING_HOUSE" ? "Nhà trọ" :
                         p.type === "APARTMENT" ? "Căn hộ" :
                         p.type === "HOUSE" ? "Nhà nguyên căn" : "Phòng studio"}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Phòng / Căn hộ</span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {availableRooms} / {totalRooms} khả dụng
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground">
                      Cập nhật: {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                    </span>

                    <Button asChild variant="ghost" className="rounded-xl text-xs font-bold text-primary hover:text-primary/95 group-hover:translate-x-1 transition-transform">
                      <Link to="/app/landlord/properties/$id" params={{ id: p.id }}>
                        Chi tiết <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
