import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PropertyService } from "@/services/property.service";
import { ArrowLeft, Bed, Eye, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/landlord/properties/$id/units")({
  component: PropertyUnits,
});

function PropertyUnits() {
  const { id } = Route.useParams();

  const { data: property, isLoading } = useQuery({
    queryKey: ["propertyDetail", id],
    queryFn: () => PropertyService.findOne(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-3xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16">
        <h2 className="text-xl font-bold">Không tìm thấy bất động sản</h2>
        <Button asChild>
          <Link to="/app/landlord/properties">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-4">
        <Link 
          to="/app/landlord/properties/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại chi tiết bất động sản
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-[oklch(0.55_0.2_285)] bg-clip-text text-transparent">
            Danh sách căn hộ / phòng trọ
          </h1>
          <p className="text-muted-foreground text-sm">
            {property.title} • {property.address}, {property.district}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
        {(!property.rooms || property.rooms.length === 0) ? (
          <div className="text-center py-12 space-y-3">
            <Bed className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="font-bold">Bất động sản này chưa được tạo phòng</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Nhấp quay lại chi tiết bất động sản để thêm phòng trọ mới nhằm thiết lập giá cả và xuất bản tin.
            </p>
            <Button asChild className="rounded-xl mt-2">
              <Link to="/app/landlord/properties/$id" params={{ id }}>Thêm phòng trọ mới</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {property.rooms.map((room: any) => (
              <div 
                key={room.id}
                className="group p-5 rounded-2xl border border-border/80 hover:border-primary/40 hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition">
                      {room.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      room.isAvailable && room.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {room.isAvailable && room.status === "AVAILABLE" ? "Còn trống" : "Đã thuê"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Giá thuê</span>
                      <span className="font-bold text-foreground mt-0.5 block">{room.price.toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Diện tích</span>
                      <span className="font-bold text-foreground mt-0.5 block">{room.area} m²</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold">Sức chứa</span>
                      <span className="font-bold text-foreground mt-0.5 block">Tối đa {room.capacity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <Button asChild variant="ghost" className="rounded-xl text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <Link to="/app/landlord/units/$id" params={{ id: room.id }}>
                      Thiết lập chi tiết <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
