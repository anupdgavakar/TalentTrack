<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Admin Content > Page Content module (post-Phase-15 follow-up): makes the
// About and Contact pages' copy/images admin-editable instead of hardcoded
// JSX, the same way Banners/Testimonials/Statistics already made the
// homepage editable.
//
// One generic table serves both pages rather than a bespoke `about_page` +
// `contact_page` schema, because the two pages need genuinely different
// shapes of content (single blocks like a hero heading vs. repeatable ones
// like the four "Our Approach" cards) and a generic, typed row already
// covers both without a proliferation of nearly-identical tables. A row is
// addressed by (`page`, `section_key`): `section_key` identifies which slot
// in that page's template the row feeds (see the frontend's
// PAGE_SECTION_KEYS for the exact list and what each one means). Some
// section_keys are meant to have exactly one row ("singleton" slots, e.g.
// `hero`) and others are meant to have several ("repeatable" slots, e.g.
// `approach_card`) — this is a convention enforced by the admin UI (see
// PageSectionManager.jsx), not the database: the public read side simply
// takes the first matching row for a singleton key and all matching rows,
// ordered by sort_order, for a repeatable one, so an accidental duplicate
// singleton row degrades gracefully instead of erroring.
//
// Every column is nullable except the two identity columns — which fields
// a given section_key actually uses varies (a checklist item only needs
// `body`; a CTA needs the primary/secondary link pairs already established
// by the `banners` table above; a card needs `icon`/`title`/`body`) — same
// reasoning as banners' own optional CTA columns.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->string('page');
            $table->string('section_key');
            $table->string('icon')->nullable();
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('body')->nullable();
            $table->string('image')->nullable();
            $table->string('primary_label')->nullable();
            $table->string('primary_url')->nullable();
            $table->string('secondary_label')->nullable();
            $table->string('secondary_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['page', 'section_key', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
