<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Candidate application system (Phase 8), training side: someone enquiring
// about / enrolling in a course. `user_id` is nullable because the public
// enrollment form doesn't require an account — a logged-in candidate gets
// it filled in automatically, a guest just supplies contact details.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone', 20)->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'contacted', 'enrolled', 'rejected'])->default('new');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};
