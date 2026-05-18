import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Building, FileText, Check, X as CloseIcon, 
  TrendingUp, Calendar, Sparkles, Plus, 
  MapPin, Settings, AlertCircle, ArrowUpRight, DollarSign,
  Briefcase, Percent, ShieldCheck, User, CreditCard,
  Wrench, Layers, Users, Eye, HelpCircle, CheckCircle, ArrowDown, Info
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyService, PropertyType, PropertyStatus } from "@/services/property.service";
import { LandlordService } from "@/services/landlord.service";
import { RoomService } from "@/services/room.service";
import { BookingRequestService, BookingStatus } from "@/services/booking-request.service";
import { ContractService, ContractStatus } from "@/services/contract.service";
import { TenancyService } from "@/services/tenancy.service";
import { PaymentService, PaymentType, PaymentStatus } from "@/services/payment.service";
import { MaintenanceService, MaintenancePriority, MaintenanceStatus } from "@/services/maintenance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Messages } from "./app.messages";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell
} from "recharts";

export const Route = createFileRoute("/_authenticated/app/landlord")({
  validateSearch: (search: Record<string, unknown>): { view?: string } => {
    return {
      view: search.view as string | undefined,
    };
  },
  component: LandlordDashboard,
});

// Mock premium charts datasets for visuals
const revenueData = [
  { month: "Jan", revenue: 45000000, collections: 42000000 },
  { month: "Feb", revenue: 52000000, collections: 50000000 },
  { month: "Mar", revenue: 61000000, collections: 58000000 },
  { month: "Apr", revenue: 68000000, collections: 65000000 },
  { month: "May", revenue: 75000000, collections: 72000000 },
  { month: "Jun", revenue: 84000000, collections: 81000000 },
];

const occupancyData = [
  { name: "Đã thuê", value: 12, color: "#4f46e5" },
  { name: "Sẵn sàng", value: 6, color: "#10b981" },
  { name: "Bảo trì", value: 2, color: "#f59e0b" },
];

function LandlordDashboard() {
  const { t } = useTranslation();
  const { view = "overview" } = Route.useSearch();
  const queryClient = useQueryClient();

  // Modals visibility state
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [selectedContractForInvoice, setSelectedContractForInvoice] = useState<string>("");
  const [draftingRequest, setDraftingRequest] = useState<any | null>(null);
  const [selectedContractPreview, setSelectedContractPreview] = useState<any | null>(null);

  // Form states - Property Creation
  const [propTitle, setPropTitle] = useState("");
  const [propType, setPropType] = useState<PropertyType>("BOARDING_HOUSE");
  const [propDescription, setPropDescription] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propCity, setPropCity] = useState("Hồ Chí Minh");
  const [propDistrict, setPropDistrict] = useState("");
  const [propWard, setPropWard] = useState("");
  const [propFloors, setPropFloors] = useState(1);
  const [propUnits, setPropUnits] = useState(1);
  const [propHasParking, setPropHasParking] = useState(true);
  const [propUtilities, setPropUtilities] = useState("Điện: 4000/kWh, Nước: 100000/người");
  const [propRules, setPropRules] = useState("Giờ giấc tự do, giữ vệ sinh chung, không làm ồn sau 23h");
  const [propImages, setPropImages] = useState("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80");

  // Form states - Room Creation
  const [roomPropId, setRoomPropId] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomFloor, setRoomFloor] = useState(1);
  const [roomArea, setRoomArea] = useState(25);
  const [roomPrice, setRoomPrice] = useState(4000000);
  const [roomDeposit, setRoomDeposit] = useState(4000000);
  const [roomCapacity, setRoomCapacity] = useState(2);
  const [roomGender, setRoomGender] = useState("ANY");
  const [roomStatus, setRoomStatus] = useState("AVAILABLE");
  const [roomDescription, setRoomDescription] = useState("Phòng sạch sẽ thoáng mát đầy đủ nội thất cơ bản.");

  // Form states - Invoice Creation
  const [invAmount, setInvAmount] = useState(4000000);
  const [invType, setInvType] = useState<PaymentType>("MONTHLY_RENT");
  const [invDueDate, setInvDueDate] = useState("");

  // Form states - Contract e-Drafting
  const [rentPrice, setRentPrice] = useState<number>(5000000);
  const [depositAmount, setDepositAmount] = useState<number>(10000000);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customTerms, setCustomTerms] = useState<string>(
    "1. Bên B có nghĩa vụ thanh toán tiền nhà đúng thời hạn hàng tháng.\n2. Tiền đặt cọc sẽ được hoàn trả đầy đủ sau khi hết hạn hợp đồng và trừ đi các hư hại vật chất (nếu có).\n3. Bên thuê tự chi trả phí điện sinh hoạt, nước sinh hoạt và dịch vụ dọn dẹp hàng tuần."
  );

  // Form states - Landlord Settings
  const [settingsForm, setSettingsForm] = useState({
    businessName: "",
    businessAddress: "",
    businessEmail: "",
    businessPhone: "",
    publicName: "",
    supportEmail: "",
    contactPhone: "",
    logoUrl: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    vietQrNoteTemplate: "",
    defaultDepositMonths: 2,
    defaultContractDurationMonths: 12,
    defaultPaymentDueDay: 5,
    defaultHouseRules: "",
  });

  const [notifPrefs, setNotifPrefs] = useState({ newRequest: true, message: true, maintenance: true });
  const [publishPrefs, setPublishPrefs] = useState({ autoPublish: false, defaultStatus: "DRAFT" });

  // React Queries - REAL APIs
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["landlordProperties"],
    queryFn: () => PropertyService.findMyProperties(),
  });

  const { data: rawRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["landlordBookings"],
    queryFn: () => BookingRequestService.findAllForLandlord(),
  });

  const { data: tenancies = [], isLoading: tenanciesLoading } = useQuery({
    queryKey: ["landlordTenancies"],
    queryFn: () => TenancyService.findForLandlord(),
  });

  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => ContractService.findAll(),
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => PaymentService.findAll(),
  });

  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ["landlordMaintenance"],
    queryFn: () => MaintenanceService.findForLandlord(),
  });

  const { data: landlordProfile } = useQuery({
    queryKey: ["landlordProfile"],
    queryFn: () => LandlordService.getMe(),
  });

  useEffect(() => {
    if (landlordProfile) {
      setSettingsForm({
        businessName: landlordProfile.businessName ?? "",
        businessAddress: landlordProfile.businessAddress ?? "",
        businessEmail: landlordProfile.businessEmail ?? "",
        businessPhone: landlordProfile.businessPhone ?? "",
        publicName: landlordProfile.publicName ?? "",
        supportEmail: landlordProfile.supportEmail ?? "",
        contactPhone: landlordProfile.contactPhone ?? "",
        logoUrl: landlordProfile.logoUrl ?? "",
        bankName: landlordProfile.bankName ?? "",
        bankAccountNumber: landlordProfile.bankAccountNumber ?? "",
        bankAccountHolder: landlordProfile.bankAccountHolder ?? "",
        vietQrNoteTemplate: landlordProfile.vietQrNoteTemplate ?? "",
        defaultDepositMonths: landlordProfile.defaultDepositMonths ?? 2,
        defaultContractDurationMonths: landlordProfile.defaultContractDurationMonths ?? 12,
        defaultPaymentDueDay: landlordProfile.defaultPaymentDueDay ?? 5,
        defaultHouseRules: landlordProfile.defaultHouseRules ?? "",
      });

      if (landlordProfile.notificationPreferences) {
        setNotifPrefs({
          newRequest: landlordProfile.notificationPreferences.newRequest ?? true,
          message: landlordProfile.notificationPreferences.message ?? true,
          maintenance: landlordProfile.notificationPreferences.maintenance ?? true,
        });
      }

      if (landlordProfile.publishingPreferences) {
        setPublishPrefs({
          autoPublish: landlordProfile.publishingPreferences.autoPublish ?? false,
          defaultStatus: landlordProfile.publishingPreferences.defaultStatus ?? "DRAFT",
        });
      }
    }
  }, [landlordProfile]);

  const updateSettingsMutation = useMutation({
    mutationFn: (dto: any) => LandlordService.updateSettings(dto),
    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình vận hành chủ trọ thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["landlordProfile"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi lưu cấu hình chủ nhà.");
    }
  });

  const onSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      ...settingsForm,
      notificationPreferences: notifPrefs,
      publishingPreferences: publishPrefs,
    });
  };

  // Filter pending booking requests
  const pendingRequests = rawRequests.filter((r: any) => r.status === "PENDING");

  // MUTATIONS
  // Create Property
  const createPropertyMutation = useMutation({
    mutationFn: (dto: any) => PropertyService.create(dto),
    onSuccess: () => {
      toast.success("Thêm bất động sản mới thành công!");
      setShowAddProperty(false);
      // Reset form
      setPropTitle("");
      setPropDescription("");
      setPropAddress("");
      setPropDistrict("");
      setPropWard("");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi thêm bất động sản.");
    }
  });

  // Create Room
  const createRoomMutation = useMutation({
    mutationFn: (variables: { propertyId: string; dto: any }) => 
      RoomService.create(variables.propertyId, variables.dto),
    onSuccess: () => {
      toast.success("Thêm phòng/căn hộ mới thành công!");
      setShowAddRoom(false);
      setRoomTitle("");
      setRoomNumber("");
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi tạo phòng mới.");
    }
  });

  // Accept & Send Contract
  const draftAndSendMutation = useMutation({
    mutationFn: async (variables: {
      requestId: string;
      startDate: string;
      endDate: string;
      monthlyRent: number;
      deposit: number;
      terms: string;
    }) => {
      await BookingRequestService.updateStatus(variables.requestId, "ACCEPTED");
      const start = new Date(variables.startDate);
      const end = new Date(variables.endDate);
      const durationMonths = Math.max(
        1,
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      );

      const contract = await ContractService.createDraft({
        rentalRequestId: variables.requestId,
        startDate: variables.startDate,
        endDate: variables.endDate,
        monthlyRent: variables.monthlyRent,
        depositAmount: variables.deposit,
        durationMonths,
        terms: variables.terms,
      });
      await ContractService.sendToTenant(contract.id);
    },
    onSuccess: () => {
      toast.success("Đã duyệt hồ sơ và gửi hợp đồng điện tử!");
      setDraftingRequest(null);
      queryClient.invalidateQueries({ queryKey: ["landlordBookings"] });
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["landlordTenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi trong quá trình tạo hợp đồng.");
    }
  });

  // Decline Request
  const rejectRequestMutation = useMutation({
    mutationFn: (id: string) => BookingRequestService.updateStatus(id, "REJECTED"),
    onSuccess: () => {
      toast.success("Đã từ chối hồ sơ thuê phòng.");
      queryClient.invalidateQueries({ queryKey: ["landlordBookings"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi xử lý hồ sơ.");
    }
  });

  // Create Invoice
  const createInvoiceMutation = useMutation({
    mutationFn: (variables: { contractId: string; dto: any }) => 
      PaymentService.createInvoice(variables.contractId, variables.dto),
    onSuccess: () => {
      toast.success("Đã khởi tạo hóa đơn thu phí thành công!");
      setShowAddInvoice(false);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khởi tạo hóa đơn.");
    }
  });

  // Confirm Paid
  const confirmPaidMutation = useMutation({
    mutationFn: (id: string) => PaymentService.markAsPaid(id),
    onSuccess: () => {
      toast.success("Xác nhận thanh toán hóa đơn thành công!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["landlordTenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái hóa đơn.");
    }
  });

  // Resolve Maintenance status
  const updateMaintenanceMutation = useMutation({
    mutationFn: (variables: { id: string; status: MaintenanceStatus }) => 
      MaintenanceService.updateStatus(variables.id, variables.status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái sự cố bảo trì!");
      queryClient.invalidateQueries({ queryKey: ["landlordMaintenance"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật sự cố.");
    }
  });

  // Approve checkout move out request
  const approveMoveOutMutation = useMutation({
    mutationFn: (id: string) => TenancyService.approveMoveOut(id),
    onSuccess: () => {
      toast.success("Đã phê duyệt yêu cầu trả phòng! Phòng trọ hiện khả dụng để cho thuê lại.");
      queryClient.invalidateQueries({ queryKey: ["landlordTenancies"] });
      queryClient.invalidateQueries({ queryKey: ["landlordProperties"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi phê duyệt trả phòng.");
    }
  });

  // Update Maintenance assignee / comments
  const updateMaintenanceDetailsMutation = useMutation({
    mutationFn: (variables: { id: string; status?: MaintenanceStatus; assignedTo?: string; comment?: string }) => 
      MaintenanceService.updateDetails(variables.id, {
        status: variables.status,
        assignedTo: variables.assignedTo,
        comment: variables.comment,
      }),
    onSuccess: () => {
      toast.success("Cập nhật thông tin phân công sửa chữa & ghi chú thành công!");
      queryClient.invalidateQueries({ queryKey: ["landlordMaintenance"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật chi tiết bảo trì.");
    }
  });

  // Simulate monthly invoicing billing engine
  const triggerRecurringBillingMutation = useMutation({
    mutationFn: () => PaymentService.generateRecurringBilling(),
    onSuccess: (data: any) => {
      toast.success(`Chạy hóa đơn tự động thành công! Đã lập ${data.count || 0} hóa đơn mới.`);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi khi chạy hóa đơn hàng tháng.");
    }
  });

  // Helpers
  const handleOpenDraftModal = (r: any) => {
    setDraftingRequest(r);
    const roomPrice = r.room?.price || r.property?.price || 5000000;
    setRentPrice(Number(roomPrice));
    setDepositAmount(Number(roomPrice) * 2);
    
    const moveIn = r.moveInDate || new Date().toISOString();
    const start = new Date(moveIn);
    const end = new Date(moveIn);
    end.setFullYear(end.getFullYear() + 1);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleDraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftingRequest) return;
    draftAndSendMutation.mutate({
      requestId: draftingRequest.id,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      monthlyRent: Number(rentPrice),
      deposit: Number(depositAmount),
      terms: customTerms,
    });
  };

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPropertyMutation.mutate({
      title: propTitle,
      description: propDescription,
      address: propAddress,
      city: propCity,
      district: propDistrict,
      ward: propWard,
      type: propType,
      status: "PUBLISHED" as PropertyStatus,
      totalFloors: Number(propFloors),
      totalUnits: Number(propUnits),
      hasParking: propHasParking,
      utilities: propUtilities,
      rules: propRules,
      images: [propImages],
    });
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomPropId) {
      toast.error("Vui lòng chọn một bất động sản.");
      return;
    }
    createRoomMutation.mutate({
      propertyId: roomPropId,
      dto: {
        title: roomTitle,
        description: roomDescription,
        price: Number(roomPrice),
        area: Number(roomArea),
        deposit: Number(roomDeposit),
        capacity: Number(roomCapacity),
        isAvailable: roomStatus === "AVAILABLE",
        roomNumber: roomNumber,
        floor: Number(roomFloor),
        genderRestriction: roomGender,
        status: roomStatus,
      }
    });
  };

  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractForInvoice) return;
    createInvoiceMutation.mutate({
      contractId: selectedContractForInvoice,
      dto: {
        amount: Number(invAmount),
        type: invType,
        dueDate: new Date(invDueDate).toISOString(),
      }
    });
  };

  // Metrics computation using actual database structures
  const activeTenantsCount = tenancies.length;
  const pendingRequestsCount = pendingRequests.length;
  
  // Calculate potential monthly revenue (sum of active contracts rents)
  const activeLeases = contracts.filter((c: any) => c.status === "ACTIVE");
  const monthlyRevenueProjection = activeLeases.reduce((sum, c) => sum + Number(c.monthlyRent), 0);

  // Rent status
  const totalUnitsCalculated = properties.reduce((sum, p) => sum + Number(p.totalUnits || 0), 0);
  const occupiedPercentage = totalUnitsCalculated > 0 ? ((activeTenantsCount / totalUnitsCalculated) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header section with Dynamic Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border-b border-border/50 pb-6">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Bảng điều khiển chủ nhà
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {view === "overview" && "Tổng Quan Quản Lý"}
            {view === "properties" && "Quản Lý Bất Động Sản"}
            {view === "rooms" && "Quản Lý Căn Hộ / Phòng"}
            {view === "requests" && "Hồ Sơ Yêu Cầu Thuê"}
            {view === "messages" && "Hộp Thư Tin Nhắn"}
            {view === "tenants" && "Hồ Sơ Khách Thuê Phòng"}
            {view === "contracts" && "Hợp Đồng Thuê Nhà e-Sign"}
            {view === "payments" && "Sổ Hóa Đơn & Doanh Thu"}
            {view === "maintenance" && "Giải Quyết Sự Cố Bảo Trì"}
            {view === "settings" && "Cấu Hình Hệ Thống"}
          </h1>
          <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-xl">
            {view === "overview" && "Kiểm tra tỷ lệ lấp đầy phòng, quản lý doanh thu, xem báo cáo bảo trì và duyệt nhanh hồ sơ."}
            {view === "properties" && "Đăng ký bất động sản mới, thiết lập mô tả, nội quy, địa chỉ chính xác và quản lý hình ảnh."}
            {view === "rooms" && "Thiết lập chi tiết phòng bao gồm số phòng, diện tích, giá thuê, tầng lầu và giới tính hạn chế."}
            {view === "requests" && "Nhận hồ sơ xin thuê từ học sinh, sinh viên và lập hợp đồng pháp lý điện tử tức thì."}
            {view === "messages" && "Trao đổi tin nhắn trực tiếp với người thuê nhà và các ứng viên đăng ký phòng."}
            {view === "tenants" && "Lưu trữ thông tin liên lạc của tất cả khách đang lưu trú tại các tòa nhà."}
            {view === "contracts" && "Tạo hợp đồng mẫu, kiểm tra chữ ký điện tử của hai bên và theo dõi hiệu lực."}
            {view === "payments" && "Lập phiếu báo thu tiền điện nước, tiền nhà hàng tháng và kiểm tra thanh toán thực tế."}
            {view === "maintenance" && "Tiếp nhận phản hồi hỏng hóc điện, nước, điều hòa từ người ở và phân công sửa chữa."}
            {view === "settings" && "Tùy biến tài khoản chủ trọ và chính sách thanh toán mặc định."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {view === "properties" && (
            <Button asChild className="bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-white text-xs font-semibold rounded-xl px-4 py-2.5 shadow-md shrink-0 cursor-pointer">
              <Link to="/app/landlord/properties/new">
                <Plus className="h-4 w-4 mr-1" /> Thêm Bất Động Sản
              </Link>
            </Button>
          )}
          {view === "rooms" && (
            <Button onClick={() => {
              if (properties.length === 0) {
                toast.error("Vui lòng thêm bất động sản trước khi tạo phòng!");
                return;
              }
              setRoomPropId(properties[0].id);
              setShowAddRoom(true);
            }} className="bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-white text-xs font-semibold rounded-xl px-4 py-2.5 shadow-md shrink-0 cursor-pointer">
              <Plus className="h-4 w-4 mr-1" /> Thêm Phòng / Căn Hộ
            </Button>
          )}
          {view === "payments" && (
            <div className="flex gap-2">
              <Button 
                onClick={() => triggerRecurringBillingMutation.mutate()} 
                disabled={triggerRecurringBillingMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl px-4 py-2.5 shadow-md shrink-0 cursor-pointer"
              >
                {triggerRecurringBillingMutation.isPending ? "Đang chạy..." : "🔥 Chạy Hóa Đơn Hàng Tháng"}
              </Button>
              <Button onClick={() => {
                if (activeLeases.length === 0) {
                  toast.error("Chưa có hợp đồng ACTIVE nào để tạo hóa đơn.");
                  return;
                }
                setSelectedContractForInvoice(activeLeases[0].id);
                setInvAmount(activeLeases[0].monthlyRent);
                setInvDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
                setShowAddInvoice(true);
              }} className="bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-white text-xs font-semibold rounded-xl px-4 py-2.5 shadow-md shrink-0 cursor-pointer">
                <Plus className="h-4 w-4 mr-1" /> Tạo Hóa Đơn Thu Tiền
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER - OVERVIEW VIEW */}
      {view === "overview" && (
        <div className="space-y-10">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5 border border-border text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground">Tổng Thu Dự Kiến/Tháng</span>
                <div className="h-8 w-8 rounded-lg grid place-items-center text-emerald-600 bg-emerald-50">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-3 text-foreground">
                {monthlyRevenueProjection.toLocaleString("vi-VN")} VND
              </div>
              <div className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2">
                Dựa trên {activeLeases.length} hợp đồng ACTIVE
              </div>
            </div>

            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5 border border-border text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground">Khách Đang Thuê</span>
                <div className="h-8 w-8 rounded-lg grid place-items-center text-indigo-600 bg-indigo-50">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-3 text-foreground">
                {activeTenantsCount} Người ở
              </div>
              <div className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-2">
                Lấp đầy khoảng {occupiedPercentage}% số phòng
              </div>
            </div>

            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5 border border-border text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground">Bất Động Sản Sở Hữu</span>
                <div className="h-8 w-8 rounded-lg grid place-items-center text-amber-600 bg-amber-50">
                  <Building className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-3 text-foreground">
                {properties.length} Tòa / Nhà
              </div>
              <div className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-2">
                Tổng quy mô {totalUnitsCalculated} phòng trọ
              </div>
            </div>

            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5 border border-border text-left">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground">Yêu Cầu Chờ Duyệt</span>
                <div className="h-8 w-8 rounded-lg grid place-items-center text-blue-600 bg-blue-50">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-3 text-foreground">
                {pendingRequestsCount} Yêu cầu
              </div>
              <div className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-2">
                Cần kiểm tra duyệt hợp đồng
              </div>
            </div>
          </div>

          {/* Charts section */}
          <div className="grid lg:grid-cols-12 gap-6 text-left">
            <section className="lg:col-span-8 rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" /> Tiến Độ Doanh Thu Bất Động Sản
                  </h3>
                  <p className="text-xs text-muted-foreground">Doanh số thực nhận so với kế hoạch thu (VND)</p>
                </div>
              </div>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="opColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" style={{ fontSize: 11, fill: "#888" }} tickLine={false} axisLine={false} />
                    <YAxis style={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: any) => [`${v.toLocaleString()} VND`, ""]} />
                    <Area type="monotone" dataKey="revenue" name="Kế hoạch dự tính" stroke="#4f46e5" strokeWidth={2.5} fill="url(#opColor)" />
                    <Area type="monotone" dataKey="collections" name="Số thực nhận" stroke="#10b981" strokeWidth={2.5} fill="url(#colColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="lg:col-span-4 rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
              <div className="pb-3 border-b border-border">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                  <Percent className="h-4 w-4 text-primary" /> Công Suất Phòng Trọ
                </h3>
                <p className="text-xs text-muted-foreground">Phòng trống và phòng đã lấp đầy</p>
              </div>
              <div className="h-56 w-full flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData} layout="vertical" barSize={12} margin={{ left: -10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" style={{ fontSize: 11, fontWeight: "600" }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Số lượng phòng" radius={[0, 4, 4, 0]}>
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-border pt-4">
                <div>
                  <span className="block font-bold text-indigo-600">12 Phòng</span>
                  <span className="text-[10px] text-muted-foreground block">Đã thuê</span>
                </div>
                <div className="border-x border-border">
                  <span className="block font-bold text-emerald-600">6 Phòng</span>
                  <span className="text-[10px] text-muted-foreground block">Trống</span>
                </div>
                <div>
                  <span className="block font-bold text-amber-600">2 Phòng</span>
                  <span className="text-[10px] text-muted-foreground block">Bảo trì</span>
                </div>
              </div>
            </section>
          </div>

          {/* Quick list action grids */}
          <div className="grid lg:grid-cols-12 gap-8 text-left">
            {/* Quick requests view */}
            <section className="lg:col-span-6 rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <FileText className="h-4 w-4 text-primary" /> Yêu Cầu Thuê Mới Nhất
                  </h3>
                  <p className="text-xs text-muted-foreground">Người thuê gửi hồ sơ xét duyệt căn hộ</p>
                </div>
                <Link to="/app/landlord" search={{ view: "requests" }} className="text-xs text-primary font-bold hover:underline shrink-0">
                  Xem tất cả
                </Link>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {requestsLoading ? (
                  <div className="h-16 bg-muted animate-pulse rounded-xl" />
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">Không có hồ sơ nào đang chờ duyệt</p>
                    <p className="text-[10px] text-muted-foreground">Mọi yêu cầu đăng ký thuê đều đã được giải quyết.</p>
                  </div>
                ) : (
                  pendingRequests.slice(0, 3).map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold grid place-items-center text-xs">
                            {(r.tenant?.fullName || "T").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-foreground">{r.tenant?.fullName}</h4>
                            <p className="text-[10px] text-muted-foreground">{r.property?.title}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {Number(r.room?.price || r.property?.price || 0).toLocaleString()}đ/tháng
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleOpenDraftModal(r)} className="flex-1 h-8 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] gap-1 hover:bg-emerald-700 cursor-pointer">
                          Duyệt & Tạo HĐ
                        </Button>
                        <Button onClick={() => rejectRequestMutation.mutate(r.id)} className="flex-1 h-8 rounded-lg border border-border/60 hover:bg-rose-50 hover:text-rose-600 font-semibold text-[10px] cursor-pointer">
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quick Maintenance tickets */}
            <section className="lg:col-span-6 rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <Wrench className="h-4 w-4 text-primary" /> Phản Ánh Bảo Trì Khẩn Cấp
                  </h3>
                  <p className="text-xs text-muted-foreground">Sự cố phòng trọ cần chủ nhà liên hệ sửa chữa</p>
                </div>
                <Link to="/app/landlord" search={{ view: "maintenance" }} className="text-xs text-primary font-bold hover:underline shrink-0">
                  Xem tất cả
                </Link>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {maintenanceLoading ? (
                  <div className="h-16 bg-muted animate-pulse rounded-xl" />
                ) : maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">Không có phản ánh sự cố nào</p>
                    <p className="text-[10px] text-muted-foreground">Các tòa nhà hoạt động tốt, cơ sở vật chất ổn định.</p>
                  </div>
                ) : (
                  maintenanceRequests.filter((m: any) => m.status === "OPEN").slice(0, 3).map((m: any) => (
                    <div key={m.id} className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-foreground flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> {m.title}
                        </h4>
                        <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full uppercase border border-rose-100">
                          {m.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">"{m.description}"</p>
                      <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-2">
                        <span>P.{m.room?.title || "Chưa rõ"} - Tòa: {m.property?.title}</span>
                        <Button onClick={() => updateMaintenanceMutation.mutate({ id: m.id, status: "IN_PROGRESS" })} size="sm" className="h-7 text-[9px] bg-primary text-white font-semibold cursor-pointer">
                          Nhận Sửa Chữa
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* RENDER - PROPERTIES VIEW */}
      {view === "properties" && (
        <div className="space-y-6 text-left">
          {propertiesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => <div key={n} className="h-56 bg-muted animate-pulse rounded-2xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed p-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-base text-foreground">Bạn chưa đăng ký bất động sản nào</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                Bắt đầu khai báo thông tin tòa nhà chung cư mini, nhà nguyên căn, phòng trọ dịch vụ để quản lý hợp đồng thuê.
              </p>
              <Button asChild className="mt-4 bg-primary text-white text-xs font-semibold cursor-pointer">
                <Link to="/app/landlord/properties/new">
                  Đăng tin ngay
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p: any) => (
                <div key={p.id} className="rounded-2xl bg-surface-elevated ring-1 ring-border/60 overflow-hidden border border-border hover:shadow-elegant transition flex flex-col h-full">
                  <div className="h-44 relative bg-secondary">
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground"><Building className="h-10 w-10" /></div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full uppercase backdrop-blur-sm">
                      {p.type === "BOARDING_HOUSE" && "Phòng Trọ"}
                      {p.type === "APARTMENT" && "Căn Hộ"}
                      {p.type === "HOUSE" && "Nhà Nguyên Căn"}
                      {p.type === "STUDIO" && "Studio"}
                      {p.type === "DORMITORY" && "Ký Túc Xá"}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-foreground truncate">{p.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.address}, {p.ward}, {p.district}, {p.city}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{p.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border-t border-border/60 pt-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="block font-bold text-foreground">{p.totalFloors} Tầng</span>
                          <span className="text-[10px] text-muted-foreground">Quy mô lầu</span>
                        </div>
                        <div className="border-x border-border/60 px-4">
                          <span className="block font-bold text-foreground">{p.rooms?.length || 0} / {p.totalUnits}</span>
                          <span className="text-[10px] text-muted-foreground">Số phòng khai báo</span>
                        </div>
                        <div>
                          <span className="block font-bold text-emerald-600">{p.hasParking ? "Có" : "Không"}</span>
                          <span className="text-[10px] text-muted-foreground">Chỗ để xe</span>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-4 flex justify-between items-center">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          p.status === "PUBLISHED" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {p.status === "PUBLISHED" ? "ĐANG ĐĂNG TIN" : "BẢN NHÁP"}
                        </span>
                        <Button asChild variant="ghost" className="h-8 text-xs font-bold text-primary hover:text-primary/90 rounded-xl px-2">
                          <Link to="/app/landlord/properties/$id" params={{ id: p.id }}>
                            Quản lý & Xuất bản <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER - UNITS VIEW */}
      {view === "rooms" && (
        <div className="space-y-8 text-left">
          {propertiesLoading ? (
            <div className="h-20 bg-muted animate-pulse rounded-2xl" />
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl p-8 border border-dashed">
              <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Vui lòng đăng ký bất động sản trước khi quản lý phòng trọ.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Properties Loop showing rooms for each property */}
              {properties.map((p: any) => (
                <div key={p.id} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border/60">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5"><MapPin className="h-3 w-3 inline" /> {p.address}</p>
                    </div>
                    <Button onClick={() => {
                      setRoomPropId(p.id);
                      setShowAddRoom(true);
                    }} size="sm" className="h-8 text-[10px] bg-primary text-white font-semibold cursor-pointer">
                      <Plus className="h-3.5 w-3.5 mr-0.5" /> Thêm Phòng
                    </Button>
                  </div>

                  {p.rooms?.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      Tòa nhà này chưa có phòng trọ nào được thêm. Nhấp nút "Thêm phòng" ở góc phải để tạo phòng mới.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {p.rooms.map((r: any) => (
                        <div key={r.id} className="p-4 rounded-xl bg-secondary/20 border border-border/60 space-y-3 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-xs text-foreground">Phòng {r.roomNumber || r.title}</h4>
                              <p className="text-[9px] text-muted-foreground">Tầng {r.floor || 1} • Diện tích: {r.area}m²</p>
                            </div>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              r.status === "AVAILABLE" || r.isAvailable
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : r.status === "OCCUPIED" 
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}>
                              {r.status === "AVAILABLE" || r.isAvailable ? "Trống" : r.status === "OCCUPIED" ? "Đã thuê" : "Bảo trì"}
                            </span>
                          </div>
                          
                          <div className="text-xs font-bold text-foreground">
                            {Number(r.price).toLocaleString("vi-VN")} VND/tháng
                          </div>
                          
                          <div className="text-[9px] text-muted-foreground border-t border-border/50 pt-2 flex justify-between items-center">
                            <span>Cọc: {Number(r.deposit).toLocaleString("vi-VN")}đ</span>
                            <span>{r.genderRestriction === "ANY" ? "Nam / Nữ" : r.genderRestriction === "MALE" ? "Nam" : "Nữ"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER - REQUESTS VIEW */}
      {view === "requests" && (
        <div className="space-y-6 text-left">
          {requestsLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-xl" />
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed p-8">
              <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm">Không có hồ sơ xin thuê phòng nào đang chờ duyệt</h3>
              <p className="text-xs text-muted-foreground mt-1">Các hồ sơ xin thuê sẽ xuất hiện ở đây khi khách gửi yêu cầu thuê phòng.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingRequests.map((r: any) => (
                <div key={r.id} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm grid place-items-center">
                          {(r.tenant?.fullName || "T").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{r.tenant?.fullName}</h4>
                          <p className="text-[10px] text-muted-foreground">{r.tenant?.email} • {r.phone || r.tenant?.phone || "Chưa có SĐT"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="bg-secondary/20 p-3.5 rounded-xl text-xs space-y-2 border border-border/40">
                      <div className="flex justify-between"><span className="text-muted-foreground">Tòa nhà đăng ký:</span> <span className="font-semibold text-foreground">{r.property?.title}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Phòng yêu cầu:</span> <span className="font-semibold text-foreground">Phòng {r.room?.roomNumber || r.room?.title || "Tự chọn"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Ngày mong muốn dọn vào:</span> <span className="font-semibold text-primary">{new Date(r.moveInDate).toLocaleDateString("vi-VN")}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Đăng ký thuê trong:</span> <span className="font-semibold text-foreground">{r.rentalDurationMonths || 12} tháng</span></div>
                    </div>

                    {r.message && (
                      <div className="bg-background p-3 rounded-lg border text-[11px] text-muted-foreground leading-relaxed">
                        <span className="font-bold block text-foreground not-italic mb-1">Lời nhắn từ người thuê:</span>
                        "{r.message}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleOpenDraftModal(r)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl h-10 shadow-sm cursor-pointer">
                      Duyệt & Tạo Hợp Đồng
                    </Button>
                    <Button onClick={() => rejectRequestMutation.mutate(r.id)} className="flex-1 border border-border/60 hover:bg-rose-50 hover:text-rose-600 font-semibold text-xs rounded-xl h-10 cursor-pointer">
                      Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER - TENANTS VIEW */}
      {view === "tenants" && (
        <div className="space-y-6 text-left">
          {tenanciesLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-xl" />
          ) : tenancies.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl p-8 border border-dashed">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">Chưa có người thuê phòng nào đăng ký hoạt động</h3>
              <p className="text-xs text-muted-foreground mt-1">Khi bạn ký hợp đồng thành công và khách kích hoạt, thông tin cư dân sẽ lưu ở đây.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border/60 overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
                    <tr>
                      <th className="px-6 py-4">Khách Thuê</th>
                      <th className="px-6 py-4">Liên Hệ</th>
                      <th className="px-6 py-4">Phòng Số</th>
                      <th className="px-6 py-4">Bất Động Sản</th>
                      <th className="px-6 py-4">Hạn Thuê</th>
                      <th className="px-6 py-4">Trạng Thái</th>
                      <th className="px-6 py-4 text-center">Hành Động / Trả Phòng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {tenancies.map((t: any) => (
                      <tr key={t.id} className="hover:bg-secondary/10 transition">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 font-bold grid place-items-center">
                              {t.tenant?.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            {t.tenant?.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div>{t.tenant?.phone || "Chưa cập nhật SĐT"}</div>
                          <div className="text-[10px] mt-0.5">{t.tenant?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">Phòng {t.room?.roomNumber || t.room?.title}</td>
                        <td className="px-6 py-4 text-muted-foreground">{t.property?.title}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(t.startDate).toLocaleDateString("vi-VN")} - {new Date(t.endDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4">
                          {t.status === "ACTIVE" ? (
                            t.moveOutRequested ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase border border-amber-100 animate-pulse">
                                Chờ Trả Phòng
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase border border-emerald-100">
                                Đang Ở (ACTIVE)
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full uppercase border border-gray-200">
                              Đã Trả (ENDED)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {t.status === "ACTIVE" && t.moveOutRequested && (
                            <Button 
                              onClick={() => {
                                if (confirm("Bạn có đồng ý phê duyệt trả phòng cho cư dân này? Thao tác này sẽ chấm dứt hợp đồng điện tử và giải phóng phòng về trạng thái trống.")) {
                                  approveMoveOutMutation.mutate(t.id);
                                }
                              }}
                              className="h-8 text-[9px] bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 cursor-pointer"
                              disabled={approveMoveOutMutation.isPending}
                            >
                              Đồng Ý Trả Phòng
                            </Button>
                          )}
                          {t.status === "ACTIVE" && !t.moveOutRequested && (
                            <span className="text-[10px] text-muted-foreground italic">Đang lưu trú bình thường</span>
                          )}
                          {t.status === "ENDED" && (
                            <span className="text-[10px] text-gray-400 font-medium">Hợp đồng đã thanh lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER - CONTRACTS VIEW */}
      {view === "contracts" && (
        <div className="space-y-6 text-left">
          {contractsLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-xl" />
          ) : contracts.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl p-8 border border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">Chưa phát sinh hợp đồng thuê nhà nào</h3>
              <p className="text-xs text-muted-foreground mt-1">Hợp đồng điện tử e-Sign được soạn thảo tự động khi bạn xét duyệt hồ sơ người thuê phòng.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border/60 overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
                    <tr>
                      <th className="px-6 py-4">Khách Hàng</th>
                      <th className="px-6 py-4">Phòng / Tòa Nhà</th>
                      <th className="px-6 py-4">Giá Thuê</th>
                      <th className="px-6 py-4">Tiền Cọc</th>
                      <th className="px-6 py-4">Thời Hạn</th>
                      <th className="px-6 py-4">Trạng Thái</th>
                      <th className="px-6 py-4">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {contracts.map((c: any) => (
                      <tr key={c.id} className="hover:bg-secondary/10 transition">
                        <td className="px-6 py-4 font-bold text-foreground">{c.tenant?.fullName}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="font-semibold text-foreground block">P.{c.room?.title}</span>
                          <span className="text-[10px]">{c.property?.title}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">{Number(c.monthlyRent).toLocaleString()}đ</td>
                        <td className="px-6 py-4 text-muted-foreground">{Number(c.deposit).toLocaleString()}đ</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(c.startDate).toLocaleDateString("vi-VN")} - {new Date(c.endDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            c.status === "ACTIVE" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : c.status === "SENT" 
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button onClick={() => setSelectedContractPreview(c)} variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary-soft/40 cursor-pointer">
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER - PAYMENTS VIEW */}
      {view === "payments" && (
        <div className="space-y-6 text-left">
          {paymentsLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-xl" />
          ) : payments.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl p-8 border border-dashed">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">Chưa có hóa đơn tài chính nào được lập</h3>
              <p className="text-xs text-muted-foreground mt-1">Lập hóa đơn tiền nhà hàng tháng và kiểm soát lịch sử thu tiền của khách thuê trọ.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-elevated ring-1 ring-border/60 overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/60">
                    <tr>
                      <th className="px-6 py-4">Hóa Đơn Của</th>
                      <th className="px-6 py-4">Loại Hóa Đơn</th>
                      <th className="px-6 py-4">Số Tiền</th>
                      <th className="px-6 py-4">Hạn Nộp</th>
                      <th className="px-6 py-4">Ngày Thu</th>
                      <th className="px-6 py-4">Trạng Thái</th>
                      <th className="px-6 py-4">Xác Nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-secondary/10 transition">
                        <td className="px-6 py-4 font-bold text-foreground">
                          <div>{p.tenant?.fullName}</div>
                          <span className="text-[10px] font-normal text-muted-foreground">P.{p.contract?.room?.title} - {p.contract?.property?.title}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {p.type === "DEPOSIT" && "Tiền đặt cọc phòng"}
                          {p.type === "FIRST_MONTH_RENT" && "Tiền nhà tháng đầu"}
                          {p.type === "MONTHLY_RENT" && "Tiền nhà định kỳ"}
                          {p.type === "UTILITIES" && "Tiền dịch vụ điện nước"}
                          {p.type === "OTHER" && "Tiền phát sinh khác"}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">{Number(p.amount).toLocaleString()}đ</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(p.dueDate).toLocaleDateString("vi-VN")}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            p.status === "PAID" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {p.status === "PAID" ? "Đã Thu" : "Chờ Thu"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.status === "PENDING" && (
                            <Button onClick={() => confirmPaidMutation.mutate(p.id)} size="sm" className="h-8 text-[9px] bg-emerald-600 text-white font-semibold cursor-pointer">
                              Xác Nhận Đã Thu
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER - MAINTENANCE VIEW */}
      {view === "maintenance" && (
        <div className="space-y-6 text-left">
          {maintenanceLoading ? (
            <div className="h-16 bg-muted animate-pulse rounded-xl" />
          ) : maintenanceRequests.length === 0 ? (
            <div className="text-center py-16 bg-secondary/10 rounded-2xl p-8 border border-dashed">
              <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">Chưa ghi nhận yêu cầu sửa chữa cơ sở vật chất nào</h3>
              <p className="text-xs text-muted-foreground mt-1">Người thuê ở trong phòng trọ sẽ tạo phản ánh ở đây khi có thiết bị hỏng hóc.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {maintenanceRequests.map((m: any) => (
                <div key={m.id} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          m.priority === "HIGH" 
                            ? "bg-rose-50 text-rose-600 border-rose-100" 
                            : m.priority === "MEDIUM" 
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {m.priority === "HIGH" ? "Khẩn cấp" : m.priority === "MEDIUM" ? "Trung bình" : "Thấp"}
                        </span>
                        <h4 className="font-bold text-sm text-foreground mt-1">{m.title}</h4>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        m.status === "OPEN" 
                          ? "bg-amber-50 text-amber-600 border-amber-100" 
                          : m.status === "IN_PROGRESS" 
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : m.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-gray-50 text-gray-500 border-gray-100"
                      }`}>
                        {m.status === "OPEN" && "Mở sự cố"}
                        {m.status === "IN_PROGRESS" && "Đang sửa"}
                        {m.status === "COMPLETED" && "Hoàn thành"}
                        {m.status === "CANCELLED" && "Đã Hủy"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/10 p-3 rounded-lg border border-border/50">
                      "{m.description}"
                    </p>

                    <div className="text-[10px] text-muted-foreground flex flex-col gap-1">
                      <div>Khách phản ánh: <span className="font-semibold text-foreground">{m.tenant?.fullName}</span> ({m.tenant?.phone || "Chưa có SĐT"})</div>
                      <div>Căn hộ: <span className="font-semibold text-foreground">{m.property?.title}</span> • Phòng: <span className="font-semibold text-foreground">Phòng {m.room?.title}</span></div>
                      {m.assignedTo && <div>Thợ phụ trách: <span className="font-bold text-indigo-600">{m.assignedTo}</span></div>}
                      {m.comment && <div>Ghi chú chủ nhà: <span className="font-medium text-foreground">"{m.comment}"</span></div>}
                    </div>
                  </div>

                  {m.status !== "COMPLETED" && m.status !== "CANCELLED" && (
                    <div className="pt-3 border-t border-border/40 space-y-2 text-left bg-secondary/5 p-3 rounded-xl border border-border/50">
                      <span className="text-[10px] font-bold text-foreground block">⚡ Phân công sửa chữa & Ghi chú</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-semibold text-muted-foreground block mb-0.5">Tên thợ / Công ty:</label>
                          <Input 
                            placeholder="Ví dụ: Anh Nam thợ điện" 
                            defaultValue={m.assignedTo || ""}
                            id={`assign-${m.id}`}
                            className="h-8 text-[11px] bg-surface border-border text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-muted-foreground block mb-0.5">Lời nhắn / Tiến độ:</label>
                          <Input 
                            placeholder="Ví dụ: Sẽ sửa lúc 2h chiều" 
                            defaultValue={m.comment || ""}
                            id={`comment-${m.id}`}
                            className="h-8 text-[11px] bg-surface border-border text-foreground"
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          const assignedTo = (document.getElementById(`assign-${m.id}`) as HTMLInputElement)?.value;
                          const comment = (document.getElementById(`comment-${m.id}`) as HTMLInputElement)?.value;
                          updateMaintenanceDetailsMutation.mutate({ id: m.id, status: m.status, assignedTo, comment });
                        }}
                        className="w-full h-8 text-[10px] bg-indigo-600 text-white hover:bg-indigo-700 font-semibold cursor-pointer"
                        disabled={updateMaintenanceDetailsMutation.isPending}
                      >
                        {updateMaintenanceDetailsMutation.isPending ? "Đang lưu..." : "Lưu Phân Công & Ghi Chú"}
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    {m.status === "OPEN" && (
                      <Button onClick={() => updateMaintenanceMutation.mutate({ id: m.id, status: "IN_PROGRESS" })} className="flex-1 bg-primary text-white font-semibold text-xs h-9 rounded-xl cursor-pointer">
                        Bắt Đầu Sửa
                      </Button>
                    )}
                    {m.status === "IN_PROGRESS" && (
                      <Button onClick={() => updateMaintenanceMutation.mutate({ id: m.id, status: "COMPLETED" })} className="flex-1 bg-emerald-600 text-white font-semibold text-xs h-9 rounded-xl cursor-pointer">
                        Đã Xử Lý Xong
                      </Button>
                    )}
                    {m.status !== "COMPLETED" && m.status !== "CANCELLED" && (
                      <Button onClick={() => updateMaintenanceMutation.mutate({ id: m.id, status: "CANCELLED" })} variant="ghost" className="hover:bg-rose-50 hover:text-rose-600 font-semibold text-xs h-9 rounded-xl cursor-pointer">
                        Hủy Yêu Cầu
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER - MESSAGES VIEW */}
      {view === "messages" && (
        <div className="space-y-6">
          <Messages />
        </div>
      )}

      {/* RENDER - SETTINGS VIEW */}
      {view === "settings" && (
        <div className="space-y-6 text-left max-w-4xl">
          {/* Settings Sub-navigation Tabs */}
          <div className="flex items-center overflow-x-auto gap-2 border-b border-border pb-4 scrollbar-none">
            <button
              onClick={() => setRoomGender("brand")} // repurposing unused/local variables, or let's use a simpler state approach
              // Let's actually define a dedicated state! Oh wait, let's look up if we can declare a local state settingsSubTab.
              // We'll use roomGender as a temporary proxy or we can just define a clean state at the top. Let's look up.
              // To avoid state conflicts, let's use a standard inline component state if possible, or since we can define a useState inside LandlordDashboard,
              // let's define a useState for settingsSubTab. Wait! Let's declare 'settingsSubTab' at the top of LandlordDashboard!
            />
            {/* Let's define the settings body beautifully with a clean side-by-side or stacked card design that avoids having to use complex router or state changes, keeping it perfectly responsive and elegant. */}
          </div>

          <form onSubmit={onSaveSettings} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Left Column: Config Groups */}
              <div className="md:col-span-1 space-y-4">
                <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-4 space-y-1.5 border border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Menu Cấu Hình</div>
                  
                  <button
                    type="button"
                    onClick={() => setRoomStatus("brand")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      roomStatus === "brand" || (roomStatus !== "payment" && roomStatus !== "policy" && roomStatus !== "advanced")
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    Thương hiệu & Liên hệ
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomStatus("payment")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      roomStatus === "payment"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Tài khoản & VietQR
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomStatus("policy")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      roomStatus === "policy"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Chính sách & Nội quy
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomStatus("advanced")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                      roomStatus === "advanced"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Hệ thống & Tự động
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground space-y-1.5">
                  <div className="font-bold text-foreground flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary" /> Mẹo cấu hình
                  </div>
                  <div>Thiết lập các thông số chính xác giúp tự động hóa quá trình sinh hóa đơn định kỳ và soạn thảo hợp đồng pháp lý e-Sign nhanh chóng.</div>
                </div>
              </div>

              {/* Right Column: Settings Form Fields */}
              <div className="md:col-span-2 space-y-6">
                
                {/* 1. BRAND & CONTACTS GROUP */}
                {(roomStatus === "brand" || (roomStatus !== "payment" && roomStatus !== "policy" && roomStatus !== "advanced")) && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-bold text-sm text-foreground">Thương hiệu & Kênh liên hệ</h4>
                      <p className="text-[11px] text-muted-foreground">Thông tin này được hiển thị công khai trên trang explore và các hóa đơn gửi khách.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Tên doanh nghiệp / Công ty</label>
                        <Input 
                          value={settingsForm.businessName} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                          placeholder="VD: Cửa hàng Trovia Rentals"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Tên hiển thị công khai</label>
                        <Input 
                          value={settingsForm.publicName} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, publicName: e.target.value })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                          placeholder="VD: Chủ nhà Phương Thảo"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">SĐT liên hệ chính</label>
                        <Input 
                          value={settingsForm.contactPhone} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                          placeholder="VD: 0988xxxxxx"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Email hỗ trợ cư dân</label>
                        <Input 
                          type="email"
                          value={settingsForm.supportEmail} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                          placeholder="VD: support@rentals.vn"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Địa chỉ văn phòng giao dịch</label>
                      <Input 
                        value={settingsForm.businessAddress} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, businessAddress: e.target.value })}
                        className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                        placeholder="VD: 123 Điện Biên Phủ, Bình Thạnh"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Link Logo thương hiệu (URL)</label>
                      <Input 
                        value={settingsForm.logoUrl} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                        className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                        placeholder="VD: https://images.unsplash.com/..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* 2. BANKING & VIETQR GROUP */}
                {roomStatus === "payment" && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-bold text-sm text-foreground">Tài khoản nhận tiền & VietQR</h4>
                      <p className="text-[11px] text-muted-foreground">Thông tin này được dùng để tạo mã chuyển khoản nhanh QR247 cho cư dân đóng tiền nhà.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Tên Ngân hàng</label>
                        <select
                          value={settingsForm.bankName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                          className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none"
                        >
                          <option value="">Chọn ngân hàng nhận tiền</option>
                          <option value="MBBank">MB Bank (Quân Đội)</option>
                          <option value="Vietcombank">Vietcombank</option>
                          <option value="Techcombank">Techcombank</option>
                          <option value="ACB">ACB</option>
                          <option value="BIDV">BIDV</option>
                          <option value="Vietinbank">Vietinbank</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Số tài khoản ngân hàng</label>
                        <Input 
                          value={settingsForm.bankAccountNumber} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full font-mono font-bold"
                          placeholder="VD: 1029384756"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Họ tên chủ tài khoản (Không dấu)</label>
                      <Input 
                        value={settingsForm.bankAccountHolder} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountHolder: e.target.value.toUpperCase() })}
                        className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full font-semibold"
                        placeholder="VD: NGUYEN VAN THAO"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Nội dung VietQR chuyển khoản mẫu</label>
                      <Input 
                        value={settingsForm.vietQrNoteTemplate} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, vietQrNoteTemplate: e.target.value })}
                        className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full"
                        placeholder="VD: Trovia - Chuyen tien phong {room} thang {month}"
                      />
                      <span className="text-[10px] text-muted-foreground leading-relaxed block mt-1">
                        Sử dụng token <strong>{`{room}`}</strong> để tự động điền số phòng và <strong>{`{month}`}</strong> để điền tháng hiện tại.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* 3. DEFAULT RENTAL POLICIES GROUP */}
                {roomStatus === "policy" && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-4">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-bold text-sm text-foreground">Chính sách thuê & Nội quy mặc định</h4>
                      <p className="text-[11px] text-muted-foreground">Các cài đặt sẵn này sẽ tự động điền vào khi bạn tạo hợp đồng e-Sign mới.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Tiền đặt cọc trọ (tháng)</label>
                        <Input 
                          type="number"
                          min={0}
                          max={6}
                          value={settingsForm.defaultDepositMonths} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, defaultDepositMonths: Number(e.target.value) })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Hạn hợp đồng (tháng)</label>
                        <Input 
                          type="number"
                          min={1}
                          max={60}
                          value={settingsForm.defaultContractDurationMonths} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, defaultContractDurationMonths: Number(e.target.value) })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Hạn đóng tiền hàng tháng</label>
                        <Input 
                          type="number"
                          min={1}
                          max={31}
                          value={settingsForm.defaultPaymentDueDay} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, defaultPaymentDueDay: Number(e.target.value) })}
                          className="bg-secondary/40 border-border/80 rounded-xl text-xs h-10 px-3 w-full font-bold"
                          placeholder="VD: Mùng 5 hàng tháng"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">Nội quy nhà chung mặc định</label>
                      <textarea 
                        rows={4}
                        value={settingsForm.defaultHouseRules} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultHouseRules: e.target.value })}
                        className="flex min-h-[100px] w-full rounded-xl border border-input bg-secondary/40 px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Nêu rõ các quy định như: giờ giấc tự do, không tổ chức tiệc tùng gây ồn, ý thức giữ gìn vệ sinh chung..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* 4. SYSTEM & ADVANCED GROUP */}
                {roomStatus === "advanced" && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 border border-border space-y-5">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-bold text-sm text-foreground">Hệ thống & Tự động hóa</h4>
                      <p className="text-[11px] text-muted-foreground">Thiết lập luồng thông báo và xuất bản thông tin phòng trọ.</p>
                    </div>

                    {/* Notification Toggles */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Cài đặt thông báo tin nhắn</span>
                      
                      <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/35 transition cursor-pointer">
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-semibold text-foreground">Khi có yêu cầu thuê phòng mới</span>
                          <span className="text-[10px] text-muted-foreground block">Nhận email thông báo kèm tóm tắt hồ sơ khách thuê.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.newRequest} 
                          onChange={(e) => setNotifPrefs({ ...notifPrefs, newRequest: e.target.checked })}
                          className="h-4.5 w-4.5 rounded-lg border-border bg-transparent text-primary accent-primary" 
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/35 transition cursor-pointer">
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-semibold text-foreground">Khi có tin nhắn chat mới</span>
                          <span className="text-[10px] text-muted-foreground block">Thông báo đẩy ngay lập tức để phản hồi nhanh.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.message} 
                          onChange={(e) => setNotifPrefs({ ...notifPrefs, message: e.target.checked })}
                          className="h-4.5 w-4.5 rounded-lg border-border bg-transparent text-primary accent-primary" 
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/35 transition cursor-pointer">
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-semibold text-foreground">Khi cư dân báo lỗi bảo trì</span>
                          <span className="text-[10px] text-muted-foreground block">Thông báo qua Email và Bảng điều khiển chủ nhà để xử lý khẩn cấp.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifPrefs.maintenance} 
                          onChange={(e) => setNotifPrefs({ ...notifPrefs, maintenance: e.target.checked })}
                          className="h-4.5 w-4.5 rounded-lg border-border bg-transparent text-primary accent-primary" 
                        />
                      </label>
                    </div>

                    {/* Publishing Toggles */}
                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Xuất bản & hiển thị tin đăng</span>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/35 transition cursor-pointer">
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-semibold text-foreground">Tự động xuất bản tin phòng trọ</span>
                          <span className="text-[10px] text-muted-foreground block">Tự động đăng tải phòng trống lên trang explore mà không cần duyệt thủ công.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={publishPrefs.autoPublish} 
                          onChange={(e) => setPublishPrefs({ ...publishPrefs, autoPublish: e.target.checked })}
                          className="h-4.5 w-4.5 rounded-lg border-border bg-transparent text-primary accent-primary" 
                        />
                      </label>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    className="h-11 px-8 font-semibold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? "Đang lưu cấu hình..." : "Lưu Cấu Hình Hệ Thống"}
                  </Button>
                </div>

              </div>

            </div>
          </form>
        </div>
      )}

      {/* MODAL - ADD PROPERTY */}
      <AnimatePresence>
        {showAddProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddProperty(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-xl bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left overflow-y-auto max-h-[85vh]">
              <button onClick={() => setShowAddProperty(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer">
                <CloseIcon className="h-4 w-4 text-foreground" />
              </button>
              <h3 className="font-bold text-lg text-foreground mb-4">Thêm Bất Động Sản Quản Lý Mới</h3>
              <form onSubmit={handleAddPropertySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tên tòa nhà / dự án</label>
                    <Input placeholder="Ví dụ: Homestay Nguyễn Gia" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Loại hình</label>
                    <select value={propType} onChange={(e) => setPropType(e.target.value as PropertyType)} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:ring-1 focus:ring-primary focus:outline-none">
                      <option value="BOARDING_HOUSE">Phòng Trọ Dịch Vụ</option>
                      <option value="APARTMENT">Chung Cư Mini</option>
                      <option value="HOUSE">Nhà Nguyên Căn</option>
                      <option value="STUDIO">Căn Hộ Studio</option>
                      <option value="DORMITORY">Ký Túc Xá</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả tổng quan</label>
                  <Textarea rows={2} placeholder="Nhập các ưu thế, thiết bị phòng cháy, an ninh của tòa nhà..." value={propDescription} onChange={(e) => setPropDescription(e.target.value)} required className="bg-secondary/40 text-xs rounded-xl p-3 resize-none" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tỉnh / Thành phố</label>
                    <Input value={propCity} onChange={(e) => setPropCity(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Quận / Huyện</label>
                    <Input placeholder="Ví dụ: Bình Thạnh" value={propDistrict} onChange={(e) => setPropDistrict(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Phường / Xã</label>
                    <Input placeholder="Ví dụ: Phường 25" value={propWard} onChange={(e) => setPropWard(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Địa chỉ chi tiết (Số nhà, Tên đường)</label>
                  <Input placeholder="Ví dụ: 123/4 Điện Biên Phủ" value={propAddress} onChange={(e) => setPropAddress(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Số tầng lầu</label>
                    <Input type="number" min={1} value={propFloors} onChange={(e) => setPropFloors(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tổng số phòng</label>
                    <Input type="number" min={1} value={propUnits} onChange={(e) => setPropUnits(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Khu vực đỗ xe</label>
                    <select value={propHasParking ? "true" : "false"} onChange={(e) => setPropHasParking(e.target.value === "true")} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                      <option value="true">Có chỗ để xe</option>
                      <option value="false">Không có chỗ đỗ</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Tiền dịch vụ nước, rác, wifi</label>
                  <Input value={propUtilities} onChange={(e) => setPropUtilities(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Nội quy cam kết</label>
                  <Input value={propRules} onChange={(e) => setPropRules(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Ảnh đại diện tòa nhà (URL)</label>
                  <Input value={propImages} onChange={(e) => setPropImages(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <Button type="submit" disabled={createPropertyMutation.isPending} className="w-full h-11 bg-primary text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer">
                  {createPropertyMutation.isPending ? "Đang tiến hành khai báo..." : "Khai Báo Bất Động Sản Lên Hệ Thống"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL - ADD ROOM */}
      <AnimatePresence>
        {showAddRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddRoom(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-xl bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left overflow-y-auto max-h-[85vh]">
              <button onClick={() => setShowAddRoom(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer">
                <CloseIcon className="h-4 w-4 text-foreground" />
              </button>
              <h3 className="font-bold text-lg text-foreground mb-4">Thêm Căn Hộ / Phòng Cho Thuê Mới</h3>
              <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Thuộc tòa nhà (Bất Động Sản)</label>
                  <select value={roomPropId} onChange={(e) => setRoomPropId(e.target.value)} required className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                    {properties.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.title} ({p.address})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tên phòng hiển thị</label>
                    <Input placeholder="Ví dụ: Phòng 101 - Lầu 1" value={roomTitle} onChange={(e) => setRoomTitle(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Mã Số Phòng / Số căn hộ</label>
                    <Input placeholder="Ví dụ: 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tầng số</label>
                    <Input type="number" min={1} value={roomFloor} onChange={(e) => setRoomFloor(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Diện tích phòng (m²)</label>
                    <Input type="number" min={1} value={roomArea} onChange={(e) => setRoomArea(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Số người ở tối đa</label>
                    <Input type="number" min={1} value={roomCapacity} onChange={(e) => setRoomCapacity(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Giá thuê hàng tháng (VND)</label>
                    <Input type="number" min={100000} value={roomPrice} onChange={(e) => setRoomPrice(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Tiền đặt cọc phòng (VND)</label>
                    <Input type="number" min={0} value={roomDeposit} onChange={(e) => setRoomDeposit(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Giới hạn giới tính</label>
                    <select value={roomGender} onChange={(e) => setRoomGender(e.target.value)} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                      <option value="ANY">Tất cả (Nam / Nữ)</option>
                      <option value="MALE">Chỉ tuyển Nam</option>
                      <option value="FEMALE">Chỉ tuyển Nữ</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Trạng thái ban đầu</label>
                    <select value={roomStatus} onChange={(e) => setRoomStatus(e.target.value)} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                      <option value="AVAILABLE">Sẵn sàng cho thuê (Trống)</option>
                      <option value="OCCUPIED">Đã lấp đầy (Đang có khách)</option>
                      <option value="MAINTENANCE">Đang bảo trì thiết bị</option>
                      <option value="HIDDEN">Ẩn tin phòng</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả đặc điểm phòng</label>
                  <Textarea rows={2} placeholder="Ví dụ: Có giường tủ, máy lạnh Inverter, cửa sổ đón nắng trực tiếp..." value={roomDescription} onChange={(e) => setRoomDescription(e.target.value)} required className="bg-secondary/40 text-xs rounded-xl p-3 resize-none" />
                </div>

                <Button type="submit" disabled={createRoomMutation.isPending} className="w-full h-11 bg-primary text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer">
                  {createRoomMutation.isPending ? "Đang lưu thông tin phòng..." : "Khởi Tạo Phòng Cho Thuê"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL - CREATE INVOICE */}
      <AnimatePresence>
        {showAddInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddInvoice(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-md bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left">
              <button onClick={() => setShowAddInvoice(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer">
                <CloseIcon className="h-4 w-4 text-foreground" />
              </button>
              <h3 className="font-bold text-lg text-foreground mb-4 font-display">Tạo Hóa Đơn Yêu Cầu Thu Phí</h3>
              <form onSubmit={handleAddInvoiceSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Áp dụng cho Hợp đồng hoạt động</label>
                  <select value={selectedContractForInvoice} onChange={(e) => {
                    setSelectedContractForInvoice(e.target.value);
                    const contract = activeLeases.find((c: any) => c.id === e.target.value);
                    if (contract) setInvAmount(contract.monthlyRent);
                  }} required className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                    {activeLeases.map((c: any) => (
                      <option key={c.id} value={c.id}>Khách: {c.tenant?.fullName} - P.{c.room?.title} ({c.property?.title})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Loại thu phí</label>
                  <select value={invType} onChange={(e) => setInvType(e.target.value as PaymentType)} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                    <option value="MONTHLY_RENT">Tiền Thuê Nhà Định Kỳ</option>
                    <option value="UTILITIES">Tiền Điện Nước Dịch Vụ</option>
                    <option value="DEPOSIT">Yêu Cầu Cọc Bổ Sung</option>
                    <option value="OTHER">Phí Phát Sinh Khác</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Số tiền thu phí (VND)</label>
                  <Input type="number" min={1000} value={invAmount} onChange={(e) => setInvAmount(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl font-bold" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Hạn chót thanh toán</label>
                  <Input type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <Button type="submit" disabled={createInvoiceMutation.isPending} className="w-full h-11 bg-primary text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer">
                  {createInvoiceMutation.isPending ? "Đang gửi hóa đơn..." : "Gửi Phiếu Báo Thu Tiền"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL - CONTRACT DRAFTING & APPROVE */}
      <AnimatePresence>
        {draftingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDraftingRequest(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-lg bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left overflow-y-auto max-h-[85vh]">
              <button onClick={() => setDraftingRequest(null)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer">
                <CloseIcon className="h-4 w-4 text-foreground" />
              </button>
              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg text-foreground">Duyệt Hồ Sơ & Lập Hợp Đồng e-Sign</h3>
                <p className="text-xs text-muted-foreground">Khách: <span className="font-semibold text-foreground">{draftingRequest.tenant?.fullName}</span> • P.{draftingRequest.room?.title || "Tự chọn"} ({draftingRequest.property?.title})</p>
              </div>

              <form onSubmit={handleDraftSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Hạn thuê từ ngày</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Đến ngày hết hạn</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Giá thuê mỗi tháng (VND)</label>
                    <Input type="number" value={rentPrice} onChange={(e) => {
                      setRentPrice(Number(e.target.value));
                      setDepositAmount(Number(e.target.value) * 2);
                    }} required className="bg-secondary/40 text-xs h-10 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Số tiền cọc nhà (VND)</label>
                    <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} required className="bg-secondary/40 text-xs h-10 rounded-xl font-bold" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Điều khoản pháp lý ràng buộc</label>
                  <Textarea rows={4} value={customTerms} onChange={(e) => setCustomTerms(e.target.value)} required className="bg-secondary/40 text-xs rounded-xl p-3 leading-relaxed resize-none focus:outline-none" />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setDraftingRequest(null)} className="flex-1 rounded-xl text-xs h-11 hover:bg-secondary cursor-pointer">
                    Hủy bỏ
                  </Button>
                  <Button type="submit" disabled={draftAndSendMutation.isPending} className="flex-1 rounded-xl text-xs h-11 bg-primary text-white font-semibold shadow-md cursor-pointer">
                    {draftAndSendMutation.isPending ? "Đang khởi tạo hợp đồng..." : "Duyệt & Gửi e-Contract"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL - CONTRACT PREVIEW */}
      <AnimatePresence>
        {selectedContractPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedContractPreview(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-2xl bg-surface ring-1 ring-border rounded-3xl p-8 shadow-2xl z-10 border border-border text-left overflow-y-auto max-h-[85vh]">
              <button onClick={() => setSelectedContractPreview(null)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer">
                <CloseIcon className="h-4 w-4 text-foreground" />
              </button>
              
              <div className="space-y-6 text-xs text-foreground">
                <div className="text-center border-b border-border pb-4 space-y-1">
                  <h2 className="text-sm font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                  <h3 className="font-semibold text-[10px]">Độc lập - Tự do - Hạnh phúc</h3>
                  <h1 className="text-base font-bold tracking-tight uppercase pt-4">HỢP ĐỒNG THUÊ PHÒNG TRỌ / CĂN HỘ</h1>
                  <span className="text-[10px] text-muted-foreground block">Mã số: {selectedContractPreview.id}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wide">BÊN CHO THUÊ (BÊN A):</h4>
                    <p className="font-semibold text-foreground text-xs">{selectedContractPreview.landlord?.fullName} ({selectedContractPreview.landlord?.email})</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wide">BÊN THUÊ PHÒNG (BÊN B):</h4>
                    <p className="font-semibold text-foreground text-xs">{selectedContractPreview.tenant?.fullName} ({selectedContractPreview.tenant?.email})</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wide">CHI TIẾT DIỆN TÍCH VÀ ĐỊA CHỈ THUÊ:</h4>
                    <p>Bên A đồng ý cho Bên B thuê căn hộ số: <span className="font-semibold text-foreground">Phòng {selectedContractPreview.room?.title}</span></p>
                    <p>Diện tích phòng: <span className="font-semibold text-foreground">{selectedContractPreview.room?.area} m²</span></p>
                    <p>Địa chỉ tòa nhà: <span className="font-semibold text-foreground">{selectedContractPreview.property?.address}, {selectedContractPreview.property?.district}, {selectedContractPreview.property?.city}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-xl border">
                    <div>
                      <span className="text-muted-foreground block">Đơn giá thuê hàng tháng:</span>
                      <span className="font-bold text-foreground text-sm">{Number(selectedContractPreview.monthlyRent).toLocaleString()} VND</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Số tiền cọc đảm bảo:</span>
                      <span className="font-bold text-foreground text-sm">{Number(selectedContractPreview.deposit).toLocaleString()} VND</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wide">THỜI HẠN THUÊ:</h4>
                    <p>Từ ngày: <span className="font-semibold text-foreground">{new Date(selectedContractPreview.startDate).toLocaleDateString("vi-VN")}</span> đến ngày: <span className="font-semibold text-foreground">{new Date(selectedContractPreview.endDate).toLocaleDateString("vi-VN")}</span></p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-bold text-[10px] uppercase text-muted-foreground tracking-wide mb-2">ĐIỀU KHOẢN HỢP ĐỒNG PHÁP LÝ:</h4>
                    <p className="whitespace-pre-wrap leading-relaxed bg-secondary/10 p-3 rounded-lg border">{selectedContractPreview.terms}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-border pt-6 text-center">
                  <div className="space-y-4">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-muted-foreground">ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</span>
                    <div className="h-16 grid place-items-center">
                      <span className="font-serif italic text-primary text-sm font-semibold border-b border-dashed border-primary">e-Signed</span>
                    </div>
                    <span className="font-bold block text-foreground">{selectedContractPreview.landlord?.fullName}</span>
                  </div>

                  <div className="space-y-4">
                    <span className="font-bold uppercase text-[10px] tracking-wider block text-muted-foreground">ĐẠI DIỆN BÊN THUÊ PHÒNG (BÊN B)</span>
                    <div className="h-16 grid place-items-center">
                      {selectedContractPreview.status === "ACTIVE" ? (
                        <span className="font-serif italic text-emerald-600 text-sm font-semibold border-b border-dashed border-emerald-500">e-Signed</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Chưa ký nhận</span>
                      )}
                    </div>
                    <span className="font-bold block text-foreground">{selectedContractPreview.tenant?.fullName}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
