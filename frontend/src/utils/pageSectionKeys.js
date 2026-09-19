/**
 * Frontend mirror of backend/app/Support/PageSectionKeys.php — every
 * (page, section_key) pair the About/Contact "fully editable content
 * blocks" admin screens (PageSectionManager, used by AboutContentPage and
 * ContactContentPage) can manage, plus the metadata the manager needs to
 * render a sensible form for each one: a human label, a short hint, which
 * fields are relevant (icon/title/subtitle/body/image/CTA links), and
 * whether the key is a *singleton* (exactly one row, edited in place —
 * hero text, an intro paragraph) or *repeatable* (a list of cards/
 * checklist items an admin can add to, reorder and remove — an approach
 * card, a checklist line).
 *
 * Keep this in sync with PageSectionKeys.php by hand, the same way
 * utils/iconMap.js's ICON_NAMES is kept in sync with what's actually
 * imported from lucide-react — both are a small, deliberately-duplicated
 * curated list rather than a shared endpoint (see the admin
 * PageSectionController's history: a `keys()` action was drafted and then
 * removed because a bare key list still wouldn't carry this richer
 * label/hint/fields metadata, so it wouldn't actually remove the need to
 * maintain this file).
 *
 * Deliberately NOT included here: the four core service pillars
 * (Training/Placement/Recruitment/Consulting) on the About page. Those
 * cards link to fixed site routes (`/training`, `/placement`, ...) and
 * stay hardcoded in AboutPage.jsx — letting an admin retitle or delete one
 * here could silently break primary site navigation, so that boundary is
 * intentional, not an oversight.
 */
export const PAGE_SECTION_KEYS = {
  about: [
    {
      key: "hero",
      label: "Hero heading",
      hint: "The page's top heading and subheading.",
      singleton: true,
      fields: ["title", "subtitle"],
    },
    {
      key: "intro",
      label: "Introduction",
      hint: "The founding-story paragraph, with an optional photo shown beside it.",
      singleton: true,
      fields: ["body", "image"],
    },
    {
      key: "why_choose_us_intro",
      label: "“Why Choose Us?” section heading",
      hint: "The heading shown above the Why Choose Us grid, plus an optional background photo. Upload an industry-relevant photo and it replaces the plain green background with that photo (tinted green so the heading and cards stay readable) and a fixed \"parallax\" scroll effect. Leave it unset to keep the plain green background. This same section also appears on the homepage.",
      singleton: true,
      fields: ["title", "image"],
    },
    {
      key: "why_choose_us_item",
      label: "Why Choose Us item",
      hint: "One icon + label shown in the Why Choose Us grid (e.g. “Mock Interviews”). Shown on both the homepage and this page.",
      singleton: false,
      fields: ["icon", "title"],
    },
    {
      key: "logo_marquee_intro",
      label: "Company strip heading",
      hint: "The eyebrow, heading and subtitle shown above the scrolling company strip on the homepage. Keep the wording general (e.g. the industry/skills your training targets) — this strip is not a claim that the listed companies are confirmed hiring partners unless they actually are.",
      singleton: true,
      fields: ["title", "subtitle"],
    },
    {
      key: "hiring_partner_logo",
      label: "Featured company",
      hint: "One company shown in the scrolling strip on the homepage — a name is enough; add a logo image too if you have the rights to use it. Use this for real hiring partners as well as well-known employers in the industry your training targets — just make sure the heading above (“Company strip heading”) doesn't claim more of a relationship than actually exists. The strip only appears once at least one entry is added.",
      singleton: false,
      fields: ["image", "title"],
    },
    {
      key: "approach_intro",
      label: "“Our Approach” section heading",
      hint: "The heading shown above the four approach cards.",
      singleton: true,
      fields: ["title"],
    },
    {
      key: "approach_card",
      label: "Approach card",
      hint: "One of the cards under “Our Approach” (e.g. “Hands-on, project-based learning”).",
      singleton: false,
      fields: ["icon", "title", "body"],
    },
    {
      key: "who_we_work_with_intro",
      label: "“Who We Work With” section heading",
      hint: "The heading shown above the job seekers / employers columns.",
      singleton: true,
      fields: ["title"],
    },
    {
      key: "job_seekers_intro",
      label: "Job seekers column intro",
      hint: "The heading and short intro above the job seekers checklist.",
      singleton: true,
      fields: ["title", "body"],
    },
    {
      key: "job_seeker_item",
      label: "Job seeker checklist item",
      hint: "One line in the job seekers checklist.",
      singleton: false,
      fields: ["body"],
    },
    {
      key: "employers_intro",
      label: "Employers column intro",
      hint: "The heading and short intro above the employers checklist.",
      singleton: true,
      fields: ["title", "body"],
    },
    {
      key: "employer_item",
      label: "Employer checklist item",
      hint: "One line in the employers checklist.",
      singleton: false,
      fields: ["body"],
    },
    {
      key: "cta",
      label: "Call-to-action",
      hint: "The closing “Ready to get started?” banner and its two buttons.",
      singleton: true,
      fields: ["title", "body", "primary_label", "primary_url", "secondary_label", "secondary_url"],
    },
  ],
  contact: [
    {
      key: "hero",
      label: "Hero heading",
      hint: "The page's top heading and subheading.",
      singleton: true,
      fields: ["title", "subtitle"],
    },
    {
      key: "get_in_touch",
      label: "“Get in touch” block",
      hint: "The heading and text shown beside the contact form, with an optional photo. The address/phone/email details themselves come from Settings, not here.",
      singleton: true,
      fields: ["title", "body", "image"],
    },
  ],
};

/**
 * Finds the one row for a singleton key (e.g. `hero`, `intro`) out of a
 * page's `/page-sections?page=...` response. Returns undefined if the row
 * doesn't exist yet (e.g. PageSectionSeeder hasn't been run against this
 * database) — callers should fall back to hardcoded copy in that case
 * rather than rendering nothing.
 */
export function findSection(sections, key) {
  return (sections || []).find((s) => s.section_key === key);
}

/**
 * Returns every row for a repeatable key (e.g. `approach_card`,
 * `job_seeker_item`), sorted by `sort_order`. The public API already
 * orders its response this way, but sorting again here is cheap and keeps
 * this helper correct on its own regardless of how the caller got its
 * `sections` array.
 */
export function listSection(sections, key) {
  return (sections || []).filter((s) => s.section_key === key).sort((a, b) => a.sort_order - b.sort_order);
}

export const FIELD_LABELS = {
  title: "Title",
  subtitle: "Subtitle",
  body: "Body text",
  icon: "Icon",
  image: "Image",
  primary_label: "Primary button label",
  primary_url: "Primary button link",
  secondary_label: "Secondary button label",
  secondary_url: "Secondary button link",
};
