import { Phone, Briefcase } from "lucide-react";
import { WhatsappIcon } from "../ui/SocialIcons";

const DEFAULT_JOB_MESSAGE = "Hi, I'm looking for a job placement through Talent Track Technologies.";

// wa.me wants a bare country-code-prefixed number — no spaces, "+", or
// other punctuation.
function toWhatsappDigits(rawNumber) {
  return (rawNumber || "").replace(/[^\d]/g, "");
}

function waLink(number, message) {
  const digits = toWhatsappDigits(number);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/**
 * The floating "Get Job" tab (left edge) and Call / WhatsApp bubbles
 * (bottom-right) seen on lots of training-institute sites (sevenmentor.com
 * being the reference a screenshot was shared of) — always-visible, fast
 * ways to reach the business without hunting for the Contact page.
 *
 * Every piece is admin-controlled from Settings → "Floating Buttons"
 * (SettingsPage.jsx): each button can be shown or hidden independently,
 * the WhatsApp number is editable there, and so is the message the "Get
 * Job" tab pre-fills. Nothing here is hardcoded copy, so it's safe for the
 * site owner to turn any of it off without a code change. Rendered once in
 * PublicLayout.jsx, fed the same `/settings/public` response the header
 * and footer already fetch, rather than issuing its own extra request for
 * the same data.
 */
export default function FloatingContactButtons({ settings }) {
  if (!settings) return null;

  // Default to shown — these are new, so a site that hasn't touched
  // Settings yet should still get the feature rather than needing an
  // admin to opt in. Saving "0" from Settings → Floating Buttons is what
  // hides one.
  const showGetJob = settings.show_get_job_button !== "0";
  const showWhatsapp = settings.show_whatsapp_button !== "0";
  const showCall = settings.show_call_button !== "0";

  const whatsappNumber = settings.whatsapp_number || settings.footer_phone;
  const jobLink = waLink(whatsappNumber, settings.get_job_whatsapp_message || DEFAULT_JOB_MESSAGE);
  const chatLink = waLink(whatsappNumber, "Hi, I'd like to know more about your courses.");
  const telLink = settings.footer_phone ? `tel:${settings.footer_phone.replace(/\s+/g, "")}` : null;

  return (
    <>
      {showGetJob && jobLink && (
        <a href={jobLink} target="_blank" rel="noopener noreferrer" className="floating-tab" aria-label="Get a job — chat with us on WhatsApp">
          <Briefcase size={16} aria-hidden="true" />
          <span>Get Job</span>
        </a>
      )}

      {(showWhatsapp || showCall) && (
        <div className="floating-bubbles">
          {showCall && telLink && (
            <a href={telLink} className="floating-bubble floating-bubble--call" aria-label="Call us">
              <Phone size={22} aria-hidden="true" />
            </a>
          )}
          {showWhatsapp && chatLink && (
            <a href={chatLink} target="_blank" rel="noopener noreferrer" className="floating-bubble floating-bubble--whatsapp" aria-label="Chat with us on WhatsApp">
              <WhatsappIcon size={24} />
            </a>
          )}
        </div>
      )}
    </>
  );
}
