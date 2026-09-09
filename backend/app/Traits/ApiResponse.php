<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * Every API response, success or failure, uses the same envelope:
 * { success, message, data }. Controllers call these helpers instead of
 * building JsonResponse objects by hand, so the shape can never drift
 * between endpoints. `errors` (validation/field errors) is only present
 * when actually given — kept out of the envelope otherwise, rather than
 * always null, to keep successful payloads clean.
 */
trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function created(mixed $data = null, string $message = 'Created'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function error(string $message = 'Something went wrong', int $status = 400, mixed $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'data' => null,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
