<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Named rate limiters (Phase 13) — every route in routes/api.php
        // already gets Laravel's default `throttle:api` (60 req/min per
        // user or IP, applied automatically via the framework's default
        // `api` middleware group), which is fine for ordinary browsing but
        // far too loose for a login form: 60 password guesses per minute
        // against one account is a real brute-force window. These two are
        // applied explicitly to `/auth/login` and `/auth/register` in
        // routes/api.php (`->middleware('throttle:login')` /
        // `->middleware('throttle:register')`) on top of the default limit,
        // not instead of it.
        RateLimiter::for('login', function (Request $request) {
            // Keyed by email+IP, not just IP — throttling by IP alone would
            // let one attacker spray guesses across many different target
            // accounts from a single IP at the same rate a legitimate user
            // retries their own forgotten password, and keying by email
            // alone would let a distributed attacker (many IPs, one target
            // email) bypass it entirely. Lowercased so "User@x.com" and
            // "user@x.com" share the same bucket.
            $key = strtolower((string) $request->input('email')).'|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('register', function (Request $request) {
            // Looser than login (this isn't a credential-guessing target),
            // just enough to make automated fake-account creation
            // noticeably slower than a real person filling out a form.
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
