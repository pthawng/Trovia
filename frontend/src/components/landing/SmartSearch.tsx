import { useState } from "react";
import { Building2, DollarSign, GraduationCap, MapPin, Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

const chips = [
  { label: "Gần Đại học (RMIT, FTU...)", filter: { query: "Đại học" } },
  { label: "Dưới 5 triệu VND", filter: { budgetMax: 200 } },
  { label: "Căn hộ Studio", filter: { type: "STUDIO" } },
  { label: "Cho phép nuôi thú cưng", filter: { query: "Thú cưng" } },
  { label: "Đầy đủ nội thất", filter: { query: "Nội thất" } },
  { label: "Phòng trọ giá rẻ", filter: { type: "BOARDING_HOUSE" } },
];

export function SmartSearch() {
  const router = useRouter();
  const [city, setCity] = useState("Ho Chi Minh");
  const [budgetRange, setBudgetRange] = useState("ALL");
  const [roomType, setRoomType] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    let budgetMin = "";
    let budgetMax = "";
    if (budgetRange !== "ALL") {
      const [min, max] = budgetRange.split("-");
      if (min) budgetMin = min;
      if (max) budgetMax = max;
    }

    const searchParams = new URLSearchParams();
    if (city) searchParams.append("city", city);
    if (roomType !== "ALL") searchParams.append("type", roomType);
    if (budgetMin) searchParams.append("budgetMin", budgetMin);
    if (budgetMax) searchParams.append("budgetMax", budgetMax);
    if (keyword) searchParams.append("query", keyword);

    router.navigate({
      to: "/app/explore",
      search: {
        city: city || undefined,
        type: roomType !== "ALL" ? roomType : undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        query: keyword || undefined,
      } as any,
    });
  };

  const handleChipClick = (filter: any) => {
    router.navigate({
      to: "/app/explore",
      search: {
        type: filter.type || undefined,
        budgetMax: filter.budgetMax || undefined,
        query: filter.query || undefined,
      } as any,
    });
  };

  return (
    <section id="explore" className="relative -mt-8 px-4 sm:px-6 text-left">
      <div className="mx-auto max-w-6xl rounded-3xl bg-surface-elevated shadow-[var(--shadow-elegant)] ring-1 ring-border p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 items-center">
          
          {/* Location field */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><MapPin className="h-3.5 w-3.5" /></span>
              Khu vực / Thành phố
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
              <option value="Ha Noi">Hà Nội</option>
              <option value="Da Nang">Đà Nẵng</option>
            </select>
          </div>

          {/* Budget field */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><DollarSign className="h-3.5 w-3.5" /></span>
              Ngân sách tối đa
            </div>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="ALL">Mọi ngân sách</option>
              <option value="0-200">Dưới 5 triệu VND (≈$200)</option>
              <option value="200-400">5M - 10 triệu VND ($200-$400)</option>
              <option value="400-600">10M - 15 triệu VND ($400-$600)</option>
              <option value="600-99999">Trên 15 triệu VND ($600+)</option>
            </select>
          </div>

          {/* Room type field */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><Building2 className="h-3.5 w-3.5" /></span>
              Loại phòng trọ
            </div>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="ALL">Tất cả loại hình</option>
              <option value="STUDIO">Phòng Studio</option>
              <option value="BOARDING_HOUSE">Nhà trọ / Phòng trọ</option>
              <option value="APARTMENT">Căn hộ nguyên căn</option>
              <option value="DORMITORY">Ký túc xá</option>
            </select>
          </div>

          {/* Nearby input */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><GraduationCap className="h-3.5 w-3.5" /></span>
              Trường học / Địa danh
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. RMIT, Bách Khoa"
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 w-full"
            />
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-4 text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-95 active:scale-98 transition duration-200"
          >
            <Search className="h-4 w-4" />
            Tìm phòng trọ
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={() => handleChipClick(c.filter)}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-primary-soft hover:text-primary hover:border-primary/20 transition-all duration-200"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
