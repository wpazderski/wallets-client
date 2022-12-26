import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { Lang } from "../store/UserSettingsSlice";
import enTranslation from "./en.json";
import plTranslation from "./pl.json";





export function getAvailableLangs(): Array<{ id: Lang, name: string }> {
    return [
        { id: "en" as Lang, name: enTranslation["langName"] },
        { id: "pl" as Lang, name: plTranslation["langName"] },
    ];
}

export const defaultLangId = "en";

const defaultNS = "translation";

const resources = {
    en: {
        translation: enTranslation,
    },
    pl: {
        translation: plTranslation,
    },
} as const;

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof defaultNS;
        resources: typeof resources["en"];
    }
}

export function init() {
    i18n
        .use(initReactI18next)
        .use(LanguageDetector)
        .init({
            ns: ["translation"],
            defaultNS,
            resources,
            fallbackLng: defaultLangId,
            interpolation: {
                escapeValue: false,
            },
        });
}
