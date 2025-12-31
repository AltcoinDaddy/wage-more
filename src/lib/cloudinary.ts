import { createServerFn } from "@tanstack/react-start";
import { serverEnv } from "~/config/env";

export const getAvatarSignature = createServerFn({ method: "POST" }).handler(
  async () => {
    const { v2: cloudinary } = await import("cloudinary");

    cloudinary.config({
      cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
      api_key: serverEnv.CLOUDINARY_API_KEY,
      api_secret: serverEnv.CLOUDINARY_API_SECRET,
    });
    const timestamp = Math.round(new Date().getTime() / 1000);

    // We force the folder and transformation so users can't upload massive raw images
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "user_avatars",
        transformation: "w_400,h_400,c_fill,q_auto", // Auto-crop to 400x400 square
      },
      serverEnv.CLOUDINARY_API_SECRET,
    );

    return {
      signature,
      timestamp,
      apiKey: serverEnv.CLOUDINARY_API_KEY,
      cloudName: serverEnv.CLOUDINARY_CLOUD_NAME,
    };
  },
);
