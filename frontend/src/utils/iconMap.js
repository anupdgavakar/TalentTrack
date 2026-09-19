import {
  Briefcase,
  Building2,
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  Target,
  Handshake,
  Compass,
  CheckCircle2,
  Star,
  Globe,
  Clock,
  BarChart3,
  ClipboardCheck,
  Search,
  FolderKanban,
  MessagesSquare,
  FileCheck2,
  IndianRupee,
  UserCheck,
  PlayCircle,
  IdCard,
} from "lucide-react";

const ICONS = {
  Briefcase,
  Building2,
  GraduationCap,
  TrendingUp,
  Users,
  Award,
  Target,
  Handshake,
  Compass,
  CheckCircle2,
  Star,
  Globe,
  Clock,
  // Added for the About page's admin-editable "Our Approach" cards (see
  // PageSectionSeeder) — kept in this same shared map rather than a
  // second one, so any future admin-editable icon field (Statistics,
  // Page Content, ...) picks from one consistent, growing set.
  ClipboardCheck,
  Search,
  // Added for the admin-editable "Why Choose Us" grid (see
  // PageSectionSeeder's why_choose_us_item rows) — same shared map as
  // above, for the same reason.
  FolderKanban,
  MessagesSquare,
  FileCheck2,
  IndianRupee,
  UserCheck,
  PlayCircle,
  IdCard,
};

/**
 * Looks up a lucide-react icon component by name — used for the
 * admin-managed `statistics.icon` and `page_sections.icon` columns (plain
 * strings, since the database can't store a component reference). Falls
 * back to a generic chart icon if the stored name doesn't match a known
 * import, so a typo in the admin panel never breaks the page.
 */
export default function getIcon(name) {
  return ICONS[name] || BarChart3;
}

/**
 * The names the admin Statistic and Page Content forms offer as a
 * <Select> — kept to this curated set rather than a free-text field, so a
 * row can never end up with an icon name that isn't actually imported
 * above.
 */
export const ICON_NAMES = Object.keys(ICONS);
