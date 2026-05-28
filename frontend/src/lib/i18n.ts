import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// VI Namespaces
import viCommon from "../locales/vi/common.json";
import viAuth from "../locales/vi/auth.json";
import viDashboard from "../locales/vi/dashboard.json";
import viProperty from "../locales/vi/property.json";
import viContract from "../locales/vi/contract.json";
import viTenant from "../locales/vi/tenant.json";
import viValidation from "../locales/vi/validation.json";
import viError from "../locales/vi/error.json";

// EN Namespaces
import enCommon from "../locales/en/common.json";
import enAuth from "../locales/en/auth.json";
import enDashboard from "../locales/en/dashboard.json";
import enProperty from "../locales/en/property.json";
import enContract from "../locales/en/contract.json";
import enTenant from "../locales/en/tenant.json";
import enValidation from "../locales/en/validation.json";
import enError from "../locales/en/error.json";

const isBrowser = typeof window !== "undefined";
const defaultLng = isBrowser ? localStorage.getItem("lng") || "vi" : "vi";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        translation: {
          common: viCommon,
          nav: viCommon.nav,
          landing: viCommon.landing,
          chat: viCommon.chat,
          auth: viAuth,
          dashboard: viDashboard,
          profile: viDashboard.profile,
          property: viProperty,
          contract: viContract,
          tenant: viTenant,
          booking: viTenant,
          validation: viValidation,
          error: viError,
        },
      },
      en: {
        translation: {
          common: enCommon,
          nav: enCommon.nav,
          landing: enCommon.landing,
          chat: enCommon.chat,
          auth: enAuth,
          dashboard: enDashboard,
          profile: enDashboard.profile,
          property: enProperty,
          contract: enContract,
          tenant: enTenant,
          booking: enTenant,
          validation: enValidation,
          error: enError,
        },
      },
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
