<?php

namespace App\Services;

use App\Mail\AdminNotification;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Single entry point for the three admin alert emails added in Phase 11
 * (new lead, new course enrollment, new job application) — resolves who
 * gets them and swallows/logs any send failure so a broken mailer can
 * never take down the public form submission that triggered it. A
 * candidate's enrollment/application/enquiry is already saved to the
 * database by the time this runs; failing to notify the admin about it
 * shouldn't turn into a 500 for the candidate.
 */
class AdminNotifier
{
    /**
     * @param  array<string, string|null>  $fields
     */
    public static function send(string $heading, string $intro, array $fields, ?string $ctaLabel = null, ?string $ctaUrl = null): void
    {
        $configured = Setting::get('admin_notification_email', config('mail.admin_notification_email'));

        // Comma-separated for multiple recipients (see .env.example's
        // ADMIN_NOTIFICATION_EMAIL comment) — Mail::to() needs an array of
        // addresses for that, not one string with commas in it.
        $recipients = collect(explode(',', (string) $configured))
            ->map(fn ($email) => trim($email))
            ->filter()
            ->all();

        if (empty($recipients)) {
            return;
        }

        try {
            Mail::to($recipients)->send(new AdminNotification($heading, $intro, $fields, $ctaLabel, $ctaUrl));
        } catch (\Throwable $e) {
            Log::error('Admin notification email failed to send.', [
                'recipients' => $recipients,
                'heading' => $heading,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
