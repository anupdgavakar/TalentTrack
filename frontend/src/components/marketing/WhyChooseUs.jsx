import SectionTitle from "../ui/SectionTitle";
import getIcon from "../../utils/iconMap";
import { findSection, listSection } from "../../utils/pageSectionKeys";

/**
 * The "Why Choose Us?" green-gradient band — a grid of square cards (icon
 * on top, label below), one per item. Rendered on both HomePage and
 * AboutPage, but the content is admin-managed from a single spot — the
 * About Page Content screen — via the `why_choose_us_intro` (singleton
 * title) and `why_choose_us_item` (repeatable icon+title) section keys.
 * See pageSectionKeys.js for why these keys live under the `about` page
 * group even though this component is also used from the homepage: it's
 * one list of company-wide selling points, not page-specific copy, so
 * there's no reason to make an admin maintain it twice.
 *
 * Same card shape and hover behavior as ServiceCard elsewhere on the site
 * (lift + shadow on hover, no other motion) — the only difference here is
 * each icon badge cycles through a small brand-color gradient palette (see
 * cards.css's `nth-child(4n+...)` rules) instead of one flat icon color.
 *
 * `sections` is whatever a page already fetched from
 * `/page-sections?page=about` — pass it straight through rather than
 * fetching again here. Renders nothing until at least one item exists.
 *
 * `why_choose_us_intro`'s optional `image` becomes this section's
 * background photo instead of the plain green gradient — see the
 * `why-choose-us--has-bg` rule in base.css for the tinted-overlay +
 * `background-attachment: fixed` "parallax" treatment (the image stays put
 * while the page scrolls past it) and why that's turned off on touch
 * devices. No image set (the default) falls back to the plain
 * `section--green` background exactly as before.
 */
export default function WhyChooseUs({ sections }) {
  const intro = findSection(sections, "why_choose_us_intro");
  const items = listSection(sections, "why_choose_us_item");

  if (items.length === 0) {
    return null;
  }

  const bgStyle = intro?.image ? { "--why-choose-us-bg-image": `url(${intro.image})` } : undefined;

  return (
    <section
      className={`section section--green${intro?.image ? " why-choose-us--has-bg" : ""}`}
      style={bgStyle}
    >
      <div className="container">
        <SectionTitle title={intro?.title || "Why Choose Us?"} align="center" />
        <div className="why-choose-us-grid">
          {items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div className="why-choose-us-item" key={item.id}>
                <span className="why-choose-us-item__icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <span className="why-choose-us-item__label">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
