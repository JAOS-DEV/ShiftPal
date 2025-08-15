import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  // Determine base path based on repository name
  // This allows the same code to work for both staging and production
  const getBasePath = () => {
    if (process.env.NODE_ENV !== "production") return "/";

    // Check if we're in the staging repository
    const isStaging = process.cwd().includes("ShiftPal-staging");
    return isStaging ? "/ShiftPal-staging/" : "/ShiftPal/";
  };

  return {
    base: getBasePath(),
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
