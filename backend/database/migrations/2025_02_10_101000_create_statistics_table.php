<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Admin-managed homepage stat chips (Phase 9/10) — feeds the frontend's
// existing StatsCard component, e.g. "500+ / Candidates Placed". `value` is
// a string (not a number) so it can hold "500+", "95%", etc., not just a
// plain integer.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('value');
            $table->string('icon', 60)->nullable(); // a lucide-react icon name
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistics');
    }
};
