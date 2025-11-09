import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@ui": path.resolve(__dirname, "src/ui"),
        "@lib": path.resolve(__dirname, "src/lib"),
        "@services": path.resolve(__dirname, "src/services"),
      },
      extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    base: "./",
    clearScreen: false,
  };
});
