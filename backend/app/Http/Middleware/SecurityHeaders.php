<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Baseline security response headers (Phase 13) — Laravel doesn't set any
 * of these by default. Applied globally (see bootstrap/app.php's
 * `$middleware->append(...)`) so every response gets them: the JSON API,
 * the `/sitemap.xml` route, and the root health-check route alike.
 *
 * Deliberately NOT included: a Content-Security-Policy. This API returns
 * only JSON (plus one small XML route), so a CSP would need to be written
 * for the *frontend's* HTML instead — it belongs in the React app's own
 * hosting config (Phase 14, once that's decided), not bolted onto API
 * responses that aren't HTML in the first place.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Stops a browser from trying to "helpfully" guess a response's
        // content type from its contents rather than trusting the
        // Content-Type header — the classic case this blocks is a file
        // upload getting sniffed and executed as something other than
        // what it was validated as.
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Nothing in this app is meant to be embedded in another site's
        // <iframe> (there's no legitimate embed use case here), so refuse
        // it outright rather than leaving clickjacking-via-iframe open.
        $response->headers->set('X-Frame-Options', 'DENY');

        // Send the full referrer on same-origin navigation (useful for
        // this site's own analytics later) but only the origin — not the
        // full URL, which could leak query strings — cross-origin.
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Explicitly opt this API out of browser features it has no use
        // for, so an embedding context (however unlikely, given
        // X-Frame-Options above) can't invoke them on its behalf.
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}
