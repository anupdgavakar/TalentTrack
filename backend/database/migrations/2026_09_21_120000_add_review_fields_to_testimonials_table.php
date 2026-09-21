<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Extends the existing testimonials table (already shown on the homepage
// via TestimonialCard) so the same admin-entered records can be styled and
// verified as real Google reviews — an admin pastes in a review actually
// left on the business's Google Business Profile, optionally links back to
// it, and marks it verified. This intentionally is NOT a live pull from
// Google's Places API: that needs a Google Cloud project, billing, an API
// key and a Place ID that only the site owner can set up, so for now real
// reviews are entered here by hand (still real content, just admin-curated
// rather than auto-fetched) — see the comment on TestimonialCard.jsx.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->date('review_date')->nullable()->after('rating');
            $table->string('google_url')->nullable()->after('review_date');
            $table->boolean('is_verified')->default(false)->after('google_url');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropColumn(['review_date', 'google_url', 'is_verified']);
        });
    }
};
