import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { fileURLToPath } from "node:url";

const aliases = [
  { find: "#env", replacement: fileURLToPath(new URL("./env.ts", import.meta.url)) },
  { find: /^~~[/](.*)/, replacement: fileURLToPath(new URL("./$1", import.meta.url)) },
  { find: /^@@[/](.*)/, replacement: fileURLToPath(new URL("./$1", import.meta.url)) },
  { find: /^~~\/?$/, replacement: fileURLToPath(new URL(".", import.meta.url)) },
  { find: /^@\/(.*)/, replacement: fileURLToPath(new URL("./app/$1", import.meta.url)) },
  { find: /^~\/(.*)/, replacement: fileURLToPath(new URL("./app/$1", import.meta.url)) },
];

export default defineConfig({
  resolve: {
    alias: aliases,
  },
  test: {
    projects: [
      {
        resolve: {
          alias: aliases,
        },
        test: {
          name: "unit",
          include: ["test/unit/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/*.{test,spec}.ts"],
          environment: "nuxt",
          testTimeout: 30000,
        },
      }),
    ],
  },
});
