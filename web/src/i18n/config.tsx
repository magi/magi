import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enUsTranslation from "./en-US/translation.json";
import zhCnTranslation from "./zh-CN/translation.json";

export const resources = {
    "en-US": {
        translation: enUsTranslation,
    },
    "zh-CN": {
        translation: zhCnTranslation,
    },
} as const;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "zh-CN",
        // debug: true,
        detection: {
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources,
    }).then();
