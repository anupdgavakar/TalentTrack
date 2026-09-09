<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use App\Models\JobApplication;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Phase 10 reporting: summary counts across leads/enrollments/applications
 * for an optional date range, plus a CSV export of leads. Deliberately
 * kept to counts and a flat export rather than charts/graphs — see
 * docs/PHASE_PLAN.md's Phase 10 section for the scope decision.
 */
class ReportController extends Controller
{
    private const LEAD_TYPES = ['recruitment', 'consulting', 'training', 'placement', 'general'];

    private const LEAD_STATUSES = ['new', 'in_progress', 'converted', 'closed'];

    private const ENROLLMENT_STATUSES = ['new', 'contacted', 'enrolled', 'rejected'];

    private const APPLICATION_STATUSES = ['new', 'shortlisted', 'interview', 'placed', 'rejected'];

    public function summary(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseRange($request);

        $leads = $this->rangeQuery(Lead::query(), $from, $to);
        $leadsByType = (clone $leads)->selectRaw('type, COUNT(*) as count')->groupBy('type')->pluck('count', 'type');
        $leadsByStatus = (clone $leads)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');

        $enrollments = $this->rangeQuery(CourseEnrollment::query(), $from, $to);
        $enrollmentsByStatus = (clone $enrollments)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');

        $applications = $this->rangeQuery(JobApplication::query(), $from, $to);
        $applicationsByStatus = (clone $applications)->selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');

        return $this->success([
            'range' => ['from' => $from?->toDateString(), 'to' => $to?->toDateString()],
            'leads' => [
                'total' => (int) $leadsByType->sum(),
                'by_type' => collect(self::LEAD_TYPES)->mapWithKeys(fn ($t) => [$t => (int) ($leadsByType[$t] ?? 0)]),
                'by_status' => collect(self::LEAD_STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($leadsByStatus[$s] ?? 0)]),
            ],
            'enrollments' => [
                'total' => (int) $enrollmentsByStatus->sum(),
                'by_status' => collect(self::ENROLLMENT_STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($enrollmentsByStatus[$s] ?? 0)]),
            ],
            'applications' => [
                'total' => (int) $applicationsByStatus->sum(),
                'by_status' => collect(self::APPLICATION_STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($applicationsByStatus[$s] ?? 0)]),
            ],
        ]);
    }

    /**
     * Streamed CSV of leads — respects the same `from`/`to` range as
     * `summary()`, plus the same `type`/`status` filters the Leads list
     * screen uses, so "export what I'm looking at" does what it says.
     * Fetched by the frontend via axios (not a plain link) so the request
     * carries the same Sanctum session auth as everything else — see
     * BannerFormPage-style multipart calls for the equivalent pattern on
     * uploads.
     */
    public function exportLeads(Request $request): StreamedResponse
    {
        [$from, $to] = $this->parseRange($request);

        $leads = $this->rangeQuery(Lead::query(), $from, $to)
            ->when($request->filled('type'), fn ($q) => $q->ofType($request->string('type')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->get();

        $filename = 'leads-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($leads) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Type', 'Name', 'Email', 'Phone', 'Company', 'Message', 'Status', 'Source', 'Submitted At']);

            foreach ($leads as $lead) {
                fputcsv($handle, [
                    $lead->id,
                    $lead->type,
                    $this->csvSafe($lead->name),
                    $this->csvSafe($lead->email),
                    $this->csvSafe($lead->phone),
                    $this->csvSafe($lead->company),
                    $this->csvSafe($lead->message),
                    $lead->status,
                    $this->csvSafe($lead->source),
                    $lead->created_at?->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function parseRange(Request $request): array
    {
        $validated = Validator::make($request->query(), [
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ])->validate();

        return [
            isset($validated['from']) ? Carbon::parse($validated['from'])->startOfDay() : null,
            isset($validated['to']) ? Carbon::parse($validated['to'])->endOfDay() : null,
        ];
    }

    private function rangeQuery($query, ?Carbon $from, ?Carbon $to)
    {
        return $query
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('created_at', '<=', $to));
    }

    /**
     * Neutralizes CSV/formula injection (Phase 15 QA fix). `Lead`'s
     * name/email/phone/company/message/source fields are all free text
     * submitted anonymously via the public `POST /leads` endpoint — nothing
     * stops a submission like `=HYPERLINK("http://evil.example","Click")`.
     * Excel/Sheets/LibreOffice all treat a cell starting with =, +, -, or @
     * as a formula to evaluate when a CSV is opened, which can be used for
     * phishing links or, depending on the spreadsheet app's settings, worse.
     * Prefixing such a value with a single quote forces it to be read back
     * as plain text instead — the standard mitigation (OWASP's CSV
     * Injection guidance) for exactly this case.
     */
    private function csvSafe(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        return in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)
            ? "'".$value
            : $value;
    }
}
