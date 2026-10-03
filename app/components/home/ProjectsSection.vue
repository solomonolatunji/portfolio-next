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
};

const projectLinkIcons = {
  Live: LiveIcon,
  GitHub: GitHubIcon,
  "Google Play": GooglePlayIcon,
  "App Store": AppleIcon,
} as const;
</script>

<template>
  <section id="projects" class="mx-auto mt-16 w-full max-w-190">
    <div class="mb-6">
      <p class="text-soft mb-1.5 text-[0.72rem] font-bold tracking-[0.16em] uppercase">
        Selected Work
      </p>
      <h2 class="text-ink m-0 text-2xl font-bold tracking-tight">Projects</h2>
    </div>

    <div class="divide-line/60 flex flex-col divide-y">
      <article
        v-for="project in projects"
        :key="project.id"
        class="grid grid-cols-1 items-baseline gap-3 py-5 md:grid-cols-[120px_1fr_auto] md:gap-6"
      >
        <div class="flex items-center gap-2 text-xs md:flex-col md:items-start">
          <span class="text-soft text-[0.68rem] font-bold tracking-[0.1em] uppercase">
            {{ categoryLabels[project.category] ?? project.category }}
          </span>
          <span class="text-soft font-mono text-xs">{{ project.year }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <h3 class="text-ink m-0 text-base font-semibold tracking-tight">{{ project.title }}</h3>
          <p class="text-muted m-0 text-sm leading-relaxed">{{ project.description }}</p>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-2 md:mt-0">
          <a
            v-for="link in project.links"
            :key="`${project.id}-${link.label}`"
            :href="link.href"
            class="text-muted bg-chip border-chip-line hover:text-ink hover:border-line-strong inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all [&_svg]:size-3.5 [&_svg]:fill-current"
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
