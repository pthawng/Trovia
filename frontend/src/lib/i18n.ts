import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "../locales/vi.json";
import en from "../locales/en.json";

const isBrowser = typeof window !== "undefined";
const defaultLng = isBrowser ? localStorage.getItem("lng") || "vi" : "vi";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    lng: defaultLng,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

if (isBrowser) {
  i18n.on("languageChanged", (lng) => {
    localStorage.setItem("lng", lng);
  });
}

export default i18n;
// Ensure side-effect imports are resolved
