import { useState } from "react";
import { Building2, DollarSign, GraduationCap, MapPin, Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function SmartSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const [city, setCity] = useState("Ho Chi Minh");
  const [budgetRange, setBudgetRange] = useState("ALL");
  const [roomType, setRoomType] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const chips = [
    { label: t("landing.smart_search.chip_near_uni"), filter: { query: "Đại học" } },
    { label: t("landing.smart_search.chip_under_5m"), filter: { budgetMax: 200 } },
    { label: t("landing.smart_search.chip_studio"), filter: { type: "STUDIO" } },
    { label: t("landing.smart_search.chip_pets"), filter: { query: "Thú cưng" } },
    { label: t("landing.smart_search.chip_furnished"), filter: { query: "Nội thất" } },
    { label: t("landing.smart_search.chip_boarding"), filter: { type: "BOARDING_HOUSE" } },
  ];

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
      to: "/explore",
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
      to: "/explore",
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
              {t("landing.smart_search.area_city")}
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="Ho Chi Minh">{t("landing.smart_search.hcm")}</option>
              <option value="Ha Noi">{t("landing.smart_search.hn")}</option>
              <option value="Da Nang">{t("landing.smart_search.dn")}</option>
            </select>
          </div>

          {/* Budget field */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><DollarSign className="h-3.5 w-3.5" /></span>
              {t("landing.smart_search.max_budget")}
            </div>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="ALL">{t("landing.smart_search.any_budget")}</option>
              <option value="0-200">{t("landing.smart_search.under_5m")}</option>
              <option value="200-400">{t("landing.smart_search.budget_range_1")}</option>
              <option value="400-600">{t("landing.smart_search.budget_range_2")}</option>
              <option value="600-99999">{t("landing.smart_search.budget_range_3")}</option>
            </select>
          </div>

          {/* Room type field */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><Building2 className="h-3.5 w-3.5" /></span>
              {t("landing.smart_search.room_type")}
            </div>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="text-sm font-semibold mt-1 bg-transparent border-none outline-none text-foreground w-full cursor-pointer appearance-none"
            >
              <option value="ALL">{t("landing.smart_search.all_types")}</option>
              <option value="STUDIO">{t("landing.smart_search.room_studio")}</option>
              <option value="BOARDING_HOUSE">{t("landing.smart_search.room_boarding")}</option>
              <option value="APARTMENT">{t("landing.smart_search.room_apartment")}</option>
              <option value="DORMITORY">{t("landing.smart_search.room_dormitory")}</option>
            </select>
          </div>

          {/* Nearby input */}
          <div className="group rounded-xl px-4 py-2 hover:bg-secondary transition-colors cursor-pointer relative">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-primary"><GraduationCap className="h-3.5 w-3.5" /></span>
              {t("landing.smart_search.school_landmark")}
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
            {t("landing.smart_search.search_btn")}
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
