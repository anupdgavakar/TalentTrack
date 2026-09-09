<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Candidate application system (Phase 8), placement side: someone applying
// to a job_posting. `resume_path` stores wherever Phase 8's file upload
// handling puts the CV (local disk / S3 — decided when that phase is
// built); this migration just reserves the column.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('job_posting_id')->constrained('job_postings')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone', 20)->nullable();
            $table->string('resume_path')->nullable();
            $table->text('cover_note')->nullable();
            $table->enum('status', ['new', 'shortlisted', 'interview', 'placed', 'rejected'])->default('new');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
