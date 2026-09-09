<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Admin-managed testimonials (Phase 9/10) shown via the frontend's existing
// TestimonialCard component.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role_title')->nullable(); // e.g. "Software Engineer"
            $table->string('company')->nullable();
            $table->text('quote');
            $table->string('avatar')->nullable();
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
