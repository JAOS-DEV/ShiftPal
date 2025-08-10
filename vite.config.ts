import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: process.env.NODE_ENV === "production" ? "/ShiftPal/" : "/",
    define: {
      // Legacy process.env support for compatibility
      "process.env.API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
