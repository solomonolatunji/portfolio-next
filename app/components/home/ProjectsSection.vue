<script setup lang="ts">
import AppleIcon from "@/components/icons/AppleIcon.vue";
import GitHubIcon from "@/components/icons/GitHubIcon.vue";
import GooglePlayIcon from "@/components/icons/GooglePlayIcon.vue";
import LiveIcon from "@/components/icons/LiveIcon.vue";
import { projects } from "@/constants/projects";

const categoryLabels: Record<string, string> = {
  web: "Web",
  mobile: "Mobile",
  ui: "UI",
  systems: "Systems / DevTools",
};

const projectLinkIcons = {
  Live: LiveIcon,
  GitHub: GitHubIcon,
  "Google Play": GooglePlayIcon,
  "App Store": AppleIcon,
} as const;
</script>

<template>
  <section id="projects" class="mx-auto w-full max-w-190 pt-[2.2rem] sm:pt-[2.4rem]">
    <div class="mb-[1.1rem] flex flex-col gap-2">
      <p class="text-soft m-0 mb-[0.7rem] text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        Selected Work
      </p>
      <h2
        class="text-ink m-0 text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-bold tracking-[-0.05em]"
      >
        Projects
      </h2>
    </div>

    <div class="flex flex-col">
      <article
        v-for="project in projects"
        :key="project.id"
        class="border-line flex flex-col gap-[0.55rem] border-t py-4 last:border-b"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink font-medium">
            {{ categoryLabels[project.category] ?? project.category }}
          </span>
          <span class="text-soft font-mono text-[0.82rem]">{{ project.year }}</span>
        </div>

        <div class="flex flex-col gap-[0.35rem]">
          <h3 class="text-ink m-0 text-[1.08rem] leading-[1.15] font-bold">{{ project.title }}</h3>
          <p class="text-muted m-0 text-[0.88rem] leading-[1.45]">{{ project.description }}</p>
        </div>

        <div class="mt-1 flex flex-wrap gap-[0.45rem]">
          <a
            v-for="link in project.links"
            :key="`${project.id}-${link.label}`"
            :href="link.href"
            class="text-muted bg-chip border-chip-line hover:text-ink hover:border-line-strong hover:bg-card-hover inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all [&_svg]:size-[0.85rem] [&_svg]:fill-current"
            :aria-label="`${project.title} ${link.label}`"
            target="_blank"
            rel="noreferrer"
          >
            <component
              :is="projectLinkIcons[link.label as keyof typeof projectLinkIcons]"
              v-if="projectLinkIcons[link.label as keyof typeof projectLinkIcons]"
              aria-hidden="true"
            />
            <span>{{ link.label }}</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
