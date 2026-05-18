import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LandlordService } from "@/services/landlord.service";
import { motion } from "motion/react";
import { 
  ShieldCheck, FileText, CheckCircle2, AlertCircle, 
  ArrowRight, UserCheck, Clock, Settings, Building, Phone, Mail, MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/landlord/onboarding")({
  component: LandlordOnboarding,
});

function LandlordOnboarding() {
  const { user, landlordProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  useEffect(() => {
    if (landlordProfile) {
      setBusinessName(landlordProfile.businessName || "");
      setBusinessAddress(landlordProfile.businessAddress || "");
      setBusinessEmail(landlordProfile.businessEmail || "");
      setBusinessPhone(landlordProfile.businessPhone || "");
    }
  }, [landlordProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await LandlordService.updateMe({
        businessName,
        businessAddress,
        businessEmail,
        businessPhone,
      });
      await refreshProfile();
      toast.success("Cập nhật thông tin chủ nhà thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể cập nhật thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const status = landlordProfile?.status || "NOT_STARTED";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header section */}
      <div className="text-center sm:text-left space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-[oklch(0.6_0.2_290)] to-[oklch(0.55_0.2_285)] bg-clip-text text-transparent">
          Trung tâm xác thực đối tác Trovia
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Quản lý tiến trình xác minh danh tính và thiết lập cấu hình hồ sơ kinh doanh của bạn.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Status side card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                Trạng thái hiện tại
              </span>
              
              {status === "ACTIVE" && (
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Đã xác minh</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tài khoản của bạn đã được phê duyệt đầy đủ quyền chủ nhà.
                    </p>
                  </div>
                </div>
              )}

              {status === "PENDING_VERIFICATION" && (
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center animate-pulse">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Đang xử lý</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hồ sơ của bạn đang được đội ngũ kiểm duyệt xem xét.
                    </p>
                  </div>
                </div>
              )}

              {status === "NOT_STARTED" && (
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-secondary text-muted-foreground grid place-items-center">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Chưa bắt đầu</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bạn chưa thực hiện gửi thông tin xác minh chủ nhà.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border mt-6">
              {status === "NOT_STARTED" && (
                <Button className="w-full rounded-xl gap-1.5" asChild>
                  <Link to="/app/become-landlord">
                    Bắt đầu xác minh <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {status === "ACTIVE" && (
                <Button className="w-full rounded-xl gap-1.5 bg-primary hover:bg-primary/95" asChild>
                  <Link to="/app/landlord">
                    Vào trang quản lý
                  </Link>
                </Button>
              )}
              {status === "PENDING_VERIFICATION" && (
                <div className="p-3 bg-secondary/30 rounded-xl text-center text-xs text-muted-foreground">
                  Dự kiến hoàn tất trong 24 giờ làm việc.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form and info details */}
        <div className="md:col-span-2 space-y-6">
          {landlordProfile ? (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Thông tin hồ sơ Host</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cập nhật các thông tin liên hệ hiển thị cho khách thuê.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-name">Tên doanh nghiệp / Cá nhân</Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="biz-name"
                        className="pl-10 h-11"
                        placeholder="e.g. Trovia Host A"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="biz-phone">Số điện thoại liên hệ</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="biz-phone"
                        className="pl-10 h-11"
                        placeholder="e.g. 0901234567"
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="biz-email">Email công việc</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="biz-email"
                        type="email"
                        className="pl-10 h-11"
                        placeholder="e.g. host@gmail.com"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="biz-addr">Địa chỉ liên hệ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="biz-addr"
                        className="pl-10 h-11"
                        placeholder="e.g. 123 Binh Thanh, HCMC"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto px-6 rounded-xl">
                    {loading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                  </Button>
                </div>
              </form>

              <div className="border-t border-border pt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Giấy tờ pháp lý đã tải lên</h4>
                  <p className="text-xs text-muted-foreground">Tài liệu xác minh danh tính quốc gia (CCCD / Hộ chiếu).</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground block">Mặt trước CCCD:</span>
                    <div className="aspect-[1.6] rounded-2xl overflow-hidden border border-border bg-muted">
                      <img 
                        src={landlordProfile.identityCardFrontUrl || ""} 
                        alt="Mặt trước CCCD" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground block">Mặt sau CCCD:</span>
                    <div className="aspect-[1.6] rounded-2xl overflow-hidden border border-border bg-muted">
                      <img 
                        src={landlordProfile.identityCardBackUrl || ""} 
                        alt="Mặt sau CCCD" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface p-12 text-center space-y-4 shadow-sm">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-bold text-lg">Chưa đăng ký đối tác</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Bạn cần hoàn tất quy trình thiết lập hồ sơ đối tác để kích hoạt các tính năng dành cho chủ nhà.
                </p>
              </div>
              <Button asChild className="rounded-xl">
                <Link to="/app/become-landlord">Bắt đầu ngay</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
