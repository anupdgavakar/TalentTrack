<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Admin Content > Banners module (Phase 9): the real, database-backed
// source for the homepage hero carousel. Column set matches the frontend's
// HERO_SLIDES shape in HomePage.jsx on purpose (eyebrow/title/description/
// image/CTAs) — once this module is wired up, `GET /api/banners` returns
// rows in this shape and HomePage.jsx swaps its static array for that
// response with no changes to Hero.jsx or useCarousel.js.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('eyebrow')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image');
            $table->string('alt_text')->nullable();
            $table->string('primary_cta_label')->nullable();
            $table->string('primary_cta_url')->nullable();
            $table->string('secondary_cta_label')->nullable();
            $table->string('secondary_cta_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
