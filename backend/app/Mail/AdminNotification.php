<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * One shared mailable behind every admin alert (Phase 11) — new lead, new
 * course enrollment, new job application — rather than three near-identical
 * classes/views. Callers (the public store() controllers) build the
 * heading/intro/fields/CTA for their own event; this class and its Blade
 * view (resources/views/emails/admin-notification.blade.php) just render
 * whatever they're given.
 *
 * Deliberately NOT queued (no ShouldQueue): the default QUEUE_CONNECTION
 * is "database", which needs a worker (`php artisan queue:work`) actually
 * running to process anything — nothing else in this app's local dev setup
 * runs one, so a queued mail would silently sit in the `jobs` table
 * instead of reaching the `log` driver where it's meant to show up for
 * verification. Sending synchronously keeps this consistent with every
 * other phase's "run the two dev servers and it just works" verification
 * story. Worth revisiting in Phase 14 (production deployment) once a real
 * mailer and a queue worker are both in the picture.
 */
class AdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array<string, string|null>  $fields  Label => value pairs shown in the email body.
     */
    public function __construct(
        public readonly string $heading,
        public readonly string $intro,
        public readonly array $fields,
        public readonly ?string $ctaLabel = null,
        public readonly ?string $ctaUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->heading);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admin-notification');
    }
}
