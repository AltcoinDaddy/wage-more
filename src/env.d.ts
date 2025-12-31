/// <reference types="vite/client" />
//
interface ImportMetaEnv {
  // Client-side environment variables
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DATABASE_URL: string;
      readonly REDIS_URL: string;
      readonly BETTER_AUTH_SECRET: string;
      readonly BETTER_AUTH_URL: string;
      readonly STRIPE_SECRET_KEY: string;
      readonly NODE_ENV: "development" | "production" | "test";
      readonly FLOW_WALLET_PRIVATE_KEY: string;
      readonly GOOGLE_CLIENT_ID: string;
      readonly GOOGLE_CLIENT_SECRET: string;
      readonly CLOUDINARY_API_KEY: string;
      readonly CLOUDINARY_API_SECRET: string;
      readonly CLOUDINARY_CLOUD_NAME: string;
    }
  }
}
