import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss()],
    resolve: {
      extensions: [".js", ".ts"],
    },
    base: "./",
    clearScreen: false,
  };
});
