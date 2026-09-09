<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Placement + Recruitment module (Phase 7) data: open roles shown on
// /placement (`listing_type` = "placement" — the client-facing job board)
// and roles being actively sourced for an employer via the Recruitment
// service (`listing_type` = "recruitment").
//
// NOTE: deliberately named `job_postings`, not `jobs` — Laravel's own queue
// system already owns a `jobs` table (see
// 0001_01_01_000002_create_jobs_table.php), so reusing that name would
// collide with the framework's queued-job storage.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('company_name')->nullable(); // employer name, where disclosed
            $table->string('location')->nullable();
            $table->enum('job_type', ['full_time', 'part_time', 'internship', 'contract'])->default('full_time');
            $table->string('experience_level', 100)->nullable(); // e.g. "0-2 years", "Senior"
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->enum('listing_type', ['placement', 'recruitment'])->default('placement');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->date('closing_date')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'is_featured']);
            $table->index('listing_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
