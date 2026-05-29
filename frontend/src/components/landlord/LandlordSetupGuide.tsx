import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building,
  CheckCircle2,
  Home,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/services/property.service";
import { cn } from "@/lib/utils";

type LandlordSetupGuideProps = {
  landlordStatus?: string;
  properties: Property[];
};

export function LandlordSetupGuide({ landlordStatus, properties }: LandlordSetupGuideProps) {
  const isVerified = landlordStatus === "ACTIVE";
  const draftProperties = properties.filter((property) => property.status === "DRAFT");
  const publishedProperties = properties.filter((property) => property.status === "PUBLISHED");
  const setupProperty = draftProperties[0] ?? properties.find((property) => property.status !== "PUBLISHED") ?? properties[0];
  const hasProperties = properties.length > 0;
  const hasRoom = properties.some((property) => (property.rooms?.length || 0) > 0);
  const hasReadyRoom = properties.some((property) =>
    property.rooms?.some((room) => room.isAvailable && room.status === "AVAILABLE"),
  );
  const hasMediaAndAmenities = properties.some(
    (property) => (property.images?.length || 0) > 0 && (property.propertyAmenities?.length || 0) > 0,
  );
  const hasPublishedProperty = publishedProperties.length > 0;
  const completedSteps = [
    isVerified,
    hasProperties,
    hasRoom,
    hasMediaAndAmenities,
    hasPublishedProperty,
  ].filter(Boolean).length;

  const primaryAction = !isVerified
    ? {
        label: "Hoàn tất xác minh",
        to: "/app/become-landlord" as const,
        search: undefined,
      }
    : !hasProperties
      ? {
          label: "Tạo bất động sản đầu tiên",
          to: "/app/landlord/properties/new" as const,
          search: undefined,
        }
      : setupProperty
        ? {
            label: "Tiếp tục thiết lập",
            to: "/app/landlord/properties/$id" as const,
            params: { id: setupProperty.id },
            search: undefined,
          }
        : {
            label: "Mở danh sách bất động sản",
            to: "/app/landlord" as const,
            search: { view: "properties" },
          };

  const title = !isVerified
    ? "Kích hoạt kênh chủ nhà"
    : !hasProperties
      ? "Thiết lập bất động sản đầu tiên"
      : draftProperties.length > 0 || !hasPublishedProperty
        ? "Tiếp tục hoàn thiện tin đăng"
        : "Hệ thống đã sẵn sàng vận hành";

  const description = !isVerified
    ? "Hoàn tất xác minh đối tác để mở quyền tạo bất động sản, thêm phòng và xuất bản tin đăng."
    : !hasProperties
      ? "Bắt đầu bằng một hồ sơ bất động sản. Dashboard vẫn hoạt động, nhưng các chỉ số sẽ sáng lên khi bạn thêm dữ liệu thật."
    : draftProperties.length > 0 || !hasPublishedProperty
      ? `Bạn đang có ${draftProperties.length || properties.length} hồ sơ cần hoàn thiện. Hoàn thiện phòng, ảnh, tiện ích rồi xuất bản khi đã sẵn sàng.`
      : "Bạn đã có tin đăng công khai. Tiếp tục theo dõi vận hành hoặc bổ sung phòng để tăng hiệu quả khai thác.";

  const steps = [
    {
      label: "Xác minh tài khoản chủ nhà",
      desc: isVerified ? "Tài khoản đã được kích hoạt." : "Cần hoàn tất hồ sơ đối tác.",
      done: isVerified,
      icon: ShieldCheck,
    },
    {
      label: "Tạo bất động sản đầu tiên",
      desc: hasProperties ? `${properties.length} bất động sản đã được tạo.` : "Khai báo tòa nhà, nhà nguyên căn hoặc phòng trọ.",
      done: hasProperties,
      icon: Building,
    },
    {
      label: "Thêm phòng/unit khả dụng",
      desc: hasReadyRoom ? "Đã có phòng sẵn sàng cho thuê." : hasRoom ? "Đã có phòng, cần mở trạng thái khả dụng." : "Thêm ít nhất một phòng để nhận yêu cầu thuê.",
      done: hasReadyRoom,
      icon: Home,
    },
    {
      label: "Hoàn thiện ảnh và tiện ích",
      desc: hasMediaAndAmenities ? "Ảnh và tiện ích đã đủ điều kiện." : "Bổ sung ảnh thật và tiện ích để tăng độ tin cậy.",
      done: hasMediaAndAmenities,
      icon: ImageIcon,
    },
    {
      label: "Xuất bản tin đăng",
      desc: hasPublishedProperty ? `${publishedProperties.length} tin đang công khai.` : "Publish khi checklist trong trang chi tiết đã đủ.",
      done: hasPublishedProperty,
      icon: Sparkles,
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated ring-1 ring-border">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Setup {completedSteps}/5
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {"params" in primaryAction && primaryAction.params ? (
                <Button asChild className="h-10 rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                  <Link to={primaryAction.to as any} params={primaryAction.params as any}>
                    {primaryAction.label}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild className="h-10 rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                  <Link to={primaryAction.to as any} search={primaryAction.search as any}>
                    {primaryAction.label}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="h-10 rounded-xl text-xs font-bold">
                <Link to="/app/landlord" search={{ view: "properties" }}>
                  Xem tài sản
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.label}
                className={cn(
                  "rounded-xl border p-3",
                  step.done ? "border-emerald-200 bg-emerald-50/70" : "border-border bg-background/60",
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg",
                      step.done ? "bg-emerald-600 text-white" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  {step.done && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                </div>
                <div className="text-xs font-bold leading-snug text-foreground">{step.label}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-border bg-secondary/25 p-6 lg:border-l lg:border-t-0">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tiếp theo nên làm</div>
          <div className="mt-3 space-y-3 text-sm">
            {!isVerified ? (
              <p className="leading-relaxed text-foreground">
                Xác minh trước giúp các bước tạo tài sản, publish và nhận yêu cầu thuê chạy đúng quyền landlord.
              </p>
            ) : !hasProperties ? (
              <p className="leading-relaxed text-foreground">
                Tạo một hồ sơ nháp trước. Sau đó bạn sẽ được đưa sang trang chi tiết để thêm phòng và publish.
              </p>
            ) : !hasPublishedProperty ? (
              <p className="leading-relaxed text-foreground">
                Mở hồ sơ nháp để kiểm tra checklist publish. Hệ thống chỉ công khai khi dữ liệu đủ tin cậy.
              </p>
            ) : (
              <p className="leading-relaxed text-foreground">
                Tin đăng đã công khai. Dashboard vận hành sẽ phản ánh yêu cầu thuê, hợp đồng và thanh toán khi phát sinh.
              </p>
            )}
            {setupProperty && (
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hồ sơ gần nhất</div>
                <div className="mt-1 truncate text-sm font-bold text-foreground">{setupProperty.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{setupProperty.status === "PUBLISHED" ? "Đang công khai" : "Bản nháp"}</div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
