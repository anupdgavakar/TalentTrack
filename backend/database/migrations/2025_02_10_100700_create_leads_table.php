<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Lead management (Phase 10): every enquiry that isn't a structured course
// enrollment or job application lands here — the general Contact form,
// Recruitment ("we need to hire") requests from employers, and Consulting
// booking requests. `type` is what the admin's Lead dashboard filters on;
// `company` is only meaningful for recruitment leads.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['recruitment', 'consulting', 'training', 'placement', 'general'])->default('general');
            $table->string('name');
            $table->string('email');
            $table->string('phone', 20)->nullable();
            $table->string('company')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'in_progress', 'converted', 'closed'])->default('new');
            $table->string('source', 100)->nullable(); // e.g. "contact_page", "recruitment_page"
            $table->timestamps();

            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
