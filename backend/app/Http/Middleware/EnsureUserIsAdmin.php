<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authorization gate for every /api/admin/* route. Registered under the
 * 'admin' alias in bootstrap/app.php and always paired with 'auth:sanctum'
 * in routes/api.php, so by the time this runs we already know the request
 * is authenticated — this only checks the role.
 */
class EnsureUserIsAdmin
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return $this->error('This action requires an administrator account.', 403);
        }

        return $next($request);
    }
}
