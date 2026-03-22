/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GA4_MEASUREMENT_ID?: string;
    readonly VITE_GOOGLE_ADS_ID?: string;
    readonly VITE_GOOGLE_ADS_CONV_WHATSAPP?: string;
    readonly VITE_GOOGLE_ADS_CONV_EMAIL?: string;
    readonly VITE_GOOGLE_ADS_CONV_PHONE?: string;
    readonly VITE_GOOGLE_ADS_CONV_CONTACT?: string;
    readonly VITE_GOOGLE_ADS_CONV_BOOKING_AVAILABILITY?: string;
    readonly VITE_GOOGLE_ADS_CONV_BOOKING_SLOT?: string;
    readonly VITE_GOOGLE_ADS_CONV_BOOKING?: string;
    readonly VITE_GOOGLE_ADS_CONV_PAYMENT?: string;
    readonly VITE_GOOGLE_ADS_CONV_BOOK_NOW?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
