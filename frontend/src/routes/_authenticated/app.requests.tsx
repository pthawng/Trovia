import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BookingRequestService } from "@/services/booking-request.service";

export const Route = createFileRoute("/_authenticated/app/requests")({ component: Requests });

const badges = {
  pending: { icon: Clock, label: "Đang chờ duyệt", className: "text-amber-700 bg-amber-50 border border-amber-200" },
  accepted: { icon: CheckCircle2, label: "Đã đồng ý", className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
  rejected: { icon: XCircle, label: "Đã từ chối", className: "text-rose-700 bg-rose-50 border border-rose-200" },
  cancelled: { icon: XCircle, label: "Đã hủy", className: "text-gray-500 bg-gray-50 border border-gray-200" },
  in_discussion: { icon: Clock, label: "Đang thảo luận", className: "text-blue-700 bg-blue-50 border border-blue-200" },
};

function Requests() {
  const { data: rawRequests = [], isLoading } = useQuery({
    queryKey: ["tenantBookings"],
    queryFn: () => BookingRequestService.findAllForTenant(),
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Yêu cầu thuê phòng</h1>
        <p className="text-muted-foreground mt-1">Theo dõi tiến độ duyệt hồ sơ thuê từ chủ nhà của bạn.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : rawRequests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-secondary/10">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Chưa có yêu cầu thuê nào</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Khi bạn gửi yêu cầu thuê phòng từ mục Khám phá, hồ sơ của bạn sẽ hiển thị đầy đủ tại đây.
          </p>
          <Button className="mt-6 rounded-xl" asChild>
            <Link to="/app/explore">Khám phá phòng trọ ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden divide-y divide-border border border-border">
          {rawRequests.map((r: any) => {
            const statusKey = r.status.toLowerCase() as keyof typeof badges;
            const b = badges[statusKey] || badges.pending;
            const propertyTitle = r.property?.title || r.room?.property?.title || "Căn hộ cho thuê";
            const cityAndDistrict = r.property ? `${r.property.district}, ${r.property.city}` : "Quận 7, TP. HCM";
            const proposedDate = new Date(r.moveInDate || r.proposedMoveInDate).toLocaleDateString("vi-VN", {
              month: "long",
              day: "numeric",
              year: "numeric"
            });
            const noteText = r.message || r.note;
            const chatThreadId = r.conversations?.[0]?.id;

            return (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-secondary/10 transition">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary grid place-items-center shrink-0 border border-primary/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{propertyTitle}</h3>
                    <p className="text-xs text-muted-foreground">
                      Địa chỉ: {cityAndDistrict} · Ngày dọn vào: <span className="font-medium text-foreground">{proposedDate}</span> · Thời hạn: {r.rentalDurationMonths} tháng
                    </p>
                    {noteText && (
                      <p className="text-xs text-muted-foreground mt-2 bg-secondary/30 px-3 py-2 rounded-xl border border-border/40 italic">
                        "{noteText}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${b.className}`}>
                    <b.icon className="h-3 w-3" /> {b.label}
                  </span>

                  {chatThreadId && (
                    <Button variant="outline" size="sm" className="rounded-xl gap-1 h-9 text-xs border-border/60 hover:text-primary hover:border-primary/40 cursor-pointer" asChild>
                      <Link to="/app/messages" search={{ activeId: chatThreadId }}>
                        <MessageSquare className="h-3.5 w-3.5" /> Trò chuyện
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
