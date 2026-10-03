import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["~/index.css"],
  colorMode: { preference: "dark", fallback: "dark" },
  devtools: { enabled: true },
  modules: [
    "@nuxt/image",
    "@nuxtjs/seo",
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
  ],
  robots: {
    robotsTxt: false,
  },
  googleFonts: {
    families: {
      "DM Sans": true,
    },
    download: false,
    inject: true,
    display: "swap",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  runtimeConfig: {
    githubClientId: "",
    githubClientSecret: "",
    spotifyClientId: "",
    spotifyClientSecret: "",
    spotifyRefreshToken: "",
    spotifyRedirectUri: "",
    public: {
      siteName: "Solomon Olatunji",
      siteShortName: "SO",
      siteUrl: "https://solomonolatunji.com",
      adminUsername: (process.env.ADMIN_GITHUB_USERNAME || "solomonolatunji").split(",")[0]!.trim(),
    },
  },
});
