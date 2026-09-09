<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Training module (Phase 6) data: the courses shown on /training and the
// homepage's "Featured Training" section (still a placeholder in
// HomePage.jsx pending this table existing).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('duration', 100)->nullable(); // e.g. "6 weeks", "3 months"
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->nullable();
            $table->enum('mode', ['online', 'offline', 'hybrid'])->default('offline');
            $table->decimal('fee', 10, 2)->nullable(); // null = "contact us" / free
            $table->string('image')->nullable();
            $table->text('syllabus')->nullable(); // free-text or JSON outline, admin-managed
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
