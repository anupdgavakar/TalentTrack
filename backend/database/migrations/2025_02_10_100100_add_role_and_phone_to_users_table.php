<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Extends the default Laravel `users` table for Talent Track's two account
// types: platform admins (Phase 9 dashboard) and candidates (people using
// the site to enrol in training / apply for jobs). Employers and other
// roles are not modelled yet — recruitment/consulting enquiries are
// captured as `leads` instead, since the brief doesn't call for an
// employer login in the current phase plan.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'candidate'])->default('candidate')->after('email');
            $table->string('phone', 20)->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'is_active']);
        });
    }
};
