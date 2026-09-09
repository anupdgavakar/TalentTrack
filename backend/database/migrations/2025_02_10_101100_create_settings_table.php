<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Simple key/value store for site-wide, admin-editable settings (Phase 9
// Settings module) — the things currently hard-coded as placeholders in the
// frontend: footer address/phone/email, social links, admin notification
// email, etc. One flexible table beats a rigid one-column-per-setting
// table, since this list will grow.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
