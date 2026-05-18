import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || "vi";

  const toggleLanguage = () => {
    const nextLng = currentLanguage === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLng);
    toast.success(
      nextLng === "vi" 
        ? "Đã chuyển sang Tiếng Việt" 
        : "Switched to English"
    );
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage} 
      className="gap-1.5 h-9 px-3 rounded-full text-xs font-semibold hover:bg-secondary border border-border/40"
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
      <span>{currentLanguage === "vi" ? "Tiếng Việt" : "English"}</span>
      <span className="text-[10px] uppercase font-bold text-primary bg-primary-soft px-1 py-0.2 rounded">
        {currentLanguage === "vi" ? "vi" : "en"}
      </span>
    </Button>
  );
}
