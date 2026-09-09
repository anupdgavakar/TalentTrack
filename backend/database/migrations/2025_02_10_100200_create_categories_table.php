<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Shared category table for both Training (courses) and Placement (job
// postings) — e.g. "IT", "Banking", "Sales", "Engineering". A `type` column
// keeps course categories and job categories in one table (so the admin
// "Categories" screen in Phase 9 is a single CRUD, not two), while still
// letting each side query only its own categories via a where('type', ...).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['course', 'job']);
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
