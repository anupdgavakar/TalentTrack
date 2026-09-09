# Admin Guide — Talent Track Technologies

This is a plain-English guide to running the site day-to-day from the
admin dashboard. It doesn't assume any technical background — for setup,
deployment, or anything involving code, see `docs/DEPLOYMENT.md` instead.
This guide is about *using* the site once it's live.

## Logging in

Go to `yoursite.com/admin/login` and sign in with your admin email and
password. If you don't have an admin account yet, see `docs/DEPLOYMENT.md`
(the account is created when the database is first set up) — whoever
deployed the site can also create additional admin accounts for your team
by adding a row to the `users` table with `role` set to `admin`, though a
proper "invite a teammate" screen isn't built yet (see the note in the
"What's not built yet" section below).

Once logged in you'll land on the **Dashboard**, and a sidebar on the left
gives you every other screen. "View site" at the bottom of the sidebar
opens the public website in a new tab so you can check how something looks
to a visitor; "Log out" ends your session.

## Dashboard

A quick-glance summary: how many courses and training categories you have,
a breakdown of course enrollments by stage (new / contacted / enrolled /
rejected), your most recent enrollments, the same pair of numbers for job
postings and job categories, a breakdown of applications by stage, and
your most recent applications. Nothing here is editable — it's a starting
point that tells you where to look next (e.g., a pile of "new" enrollments
means it's time to visit the Enrollments screen).

## Courses (Training)

**Courses** is where you manage everything that shows up on the public
Training pages.

- **Add Course** to create one: title, description, price, duration, an
  image, which category it belongs to, and two toggles — **Active**
  (unchecked = hidden from the public site, useful for drafts) and
  **Featured** (shows it in the homepage's highlighted section).
- Click **Edit** on any course to change these same fields.
- The **Slug** field controls the course's web address
  (`/training/your-slug`) — leave it blank when creating a course and it's
  generated automatically from the title. If you're editing an existing
  course, leave the slug field exactly as it is unless you specifically
  need to change the URL, since changing it changes the page's address
  (any link someone already has to the old address will stop working).
- **Delete** removes a course entirely, including its public listing. If
  anyone has already enrolled in it, you'll see a warning that says so
  before you confirm — the enrollment records themselves aren't deleted,
  they just lose their course link.

**Categories** (in the sidebar, just below Courses) is where you manage
the groupings courses are filed under (e.g. "Web Development," "Data
Science") — add, rename, or deactivate them the same way. A category with
courses still assigned to it can still be deleted; those courses just show
without a category afterward rather than disappearing.

## Job Postings (Placement & Recruitment)

Works the same way as Courses, with a few job-specific fields:

- **Listing Type** — whether a posting appears under the site's Placement
  or Recruitment section.
- **Job Type** — full-time, part-time, contract, etc.
- **Closing Date** (optional) — once this date passes, the listing stops
  accepting applications and disappears from the public site
  automatically. You don't also need to switch **Active** off — the two
  are independent, so a posting can be taken down early by switching
  Active off even before its closing date, or left to expire naturally on
  its closing date.
- **Delete** carries the same warning as Courses if anyone has already
  applied.

**Job Categories** manages the groupings job postings are filed under, the
same way Categories does for courses.

## Enrollments and Applications (your pipeline)

Every time someone submits the "Enroll" form on a course page, it shows up
on the **Enrollments** screen; every job application shows up on
**Applications**. Both work the same way:

- Filter by status using the dropdown at the top.
- Click into any row to see the full submission (name, email, phone,
  message, and — for job applications — their uploaded resume, if they
  attached one).
- Move it through your pipeline by changing its status:
  - Enrollments: **New → Contacted → Enrolled**, or **Rejected**.
  - Applications: **New → Shortlisted → Interview → Placed**, or
    **Rejected**.

These stages don't trigger anything automatically (no emails go out when
you change a status) — they're purely for your own tracking, so you can
see at a glance what still needs a follow-up call versus what's already
been handled.

## Leads

Catches everything submitted through the site's general Contact form and
the enquiry forms on the Recruitment and Consulting pages. Each lead is
tagged with a **Type** (Recruitment, Consulting, Training, Placement, or
General) so you can tell at a glance which part of the site it came from,
even though they all land in one shared inbox. Leads move through **New →
In Progress → Converted**, or **Closed**, the same pattern as Enrollments
and Applications.

## Banners

Controls the rotating hero images on the homepage. Each banner has an
image, a headline, optional subtext, an optional button (label + link),
and the same Active toggle as everything else. **Sort Order** controls
which one shows first — lower numbers appear earlier in the rotation.

## Testimonials

Manages the quotes/reviews shown around the site — name, role/company,
photo (optional), the quote itself, a star rating, and Active/Featured
toggles (Featured testimonials are the ones prioritized on the homepage).

## Statistics

The small counters shown on the homepage (e.g. "500+ Students Placed") —
each one is a label, a number, and an icon choice. Purely manual: these
don't calculate themselves from your actual enrollment/application data,
so update them yourself as real milestones are hit.

## About Content and Contact Content

These two screens let you edit the text, icons and photos on the public
**About** and **Contact** pages yourself — no developer needed for a
wording change or a new photo.

Each screen lists the page's content in named blocks (e.g. "Hero
heading", "Introduction", "Approach card"). A block is one of two kinds:

- **A single block** (Hero heading, Introduction, the "Ready to get
  started?" banner, and similar) — there's only ever one of these, so the
  panel shows an **Edit** button that opens it directly.
- **A repeatable list** (the four "Our Approach" cards, the job-seeker and
  employer checklist items) — these have their own **Add item** button,
  plus an Edit/Delete on each row, and a **Display order** number that
  controls the order they appear in (lower numbers show first). Turning
  off "Show this on the page" hides one item without deleting it.

Some blocks have an optional **Image** field. These start out empty (a
plain text block) — upload a real photo whenever you have one, and the
public page adds it automatically; there's nothing to configure beyond
picking the file. Photos are automatically resized so they load quickly,
the same as Banner and Course images.

**What's intentionally not editable here:** the four service cards on the
About page (Training / Placement / Recruitment / Consulting) link to
fixed pages elsewhere on the site, so they're kept out of this system —
editing them would risk broken navigation. And the address/phone/email
shown on the Contact page come from the **Settings** screen below, not
from here.

## Settings

One screen for the handful of values that appear site-wide rather than on
any one page:

- Footer contact details — address, phone, email.
- Social media links — Facebook, Instagram, LinkedIn, YouTube (leave any
  of these blank to hide that icon from the footer).
- The admin notification email address(es) — see the next section.

Changes here take effect immediately across the whole public site, no
rebuild or redeploy needed.

## Getting notified about new activity

Every new enrollment, application, and lead sends an email automatically
so you don't have to keep the dashboard open all day waiting for
something to arrive. Where that email goes is controlled by the **Admin
Notification Email** field on the Settings screen — enter one address, or
several separated by commas, if more than one person should be notified.
If you leave it blank, whoever deployed the site may have set a fallback
address in the server configuration (`docs/DEPLOYMENT.md` covers this),
but setting it here is the easier way to change it going forward, since it
takes effect immediately with no server access needed.

## Reports

**Reports** gives you totals for leads, enrollments, and applications over
a date range you choose (or all-time, if you leave the range blank) —
broken down by type/status the same way the Dashboard is, just with a
date filter and, for leads specifically, an **Export CSV** button that
downloads every matching lead as a spreadsheet you can open in Excel or
Google Sheets.

## Reference: who can see what

Everything under `/admin/...` requires being logged in as an admin — there
is no separate "editor" or "viewer" role with limited access; every admin
account can do everything described in this guide. Ordinary site visitors
who register an account (via the public "Register" page) get a much
smaller "My Dashboard" view of just their own enrollments and
applications — they never see anyone else's data, and they can't reach
any of the screens in this guide.

## What's not built yet

A few things worth knowing about so they don't come as a surprise:

- **No "invite a teammate" screen.** Creating a second admin account today
  means a direct database change, not something doable from the dashboard
  itself.
- **Status changes don't send emails.** Moving an application to
  "Shortlisted," for instance, doesn't notify the candidate — that's a
  manual follow-up on your end (call, email) outside the system, for now.
- **No image cropping/resizing tool.** Whatever image you upload for a
  course, job, banner, or testimonial is used as-is — sizing and cropping
  it beforehand (in any regular photo editor) before uploading will give
  better results than uploading a very large or oddly-shaped original.
- **Privacy Policy and Terms of Use pages are still placeholders** on the
  public site — see `docs/PHASE_PLAN.md`'s open items for details; these
  need real legal copy from your side before launch, not something this
  guide or the dashboard can fill in.

For anything beyond this guide — a bug, a new feature idea, changing how
something behaves — see `HANDOVER.md` for how the project is organized and
where to go from here.
