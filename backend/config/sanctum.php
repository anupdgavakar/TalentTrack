<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Requests from these domains / hosts will receive stateful (cookie +
    | session, CSRF-protected) authentication instead of needing a bearer
    | token — this is what lets the React SPA (SANCTUM_STATEFUL_DOMAINS in
    | .env, default the Vite dev server ports) log in with a normal
    | POST /api/auth/login call and just stay logged in via cookies.
    |
    */

    'stateful' => explode(',', (string) env(
        'SANCTUM_STATEFUL_DOMAINS',
        sprintf(
            '%s%s',
            'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173,::1',
            Sanctum::currentApplicationUrlWithPort()
        )
    )),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    |
    | The authentication guard(s) that will be checked when Sanctum is
    | trying to authenticate a request. If a request from one of the
    | guards is authenticated, Sanctum will not attempt to authenticate
    | the request via its cookie / token based authentication process.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | This value controls the number of minutes until an issued personal
    | access token / stateful session will be considered expired. Left
    | null, tokens are not automatically expired.
    |
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    |
    | Sanctum can prefix new tokens for easier identification in things
    | like GitHub's secret scanning, if it's ever needed.
    |
    */

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    |
    | When authenticating your first-party SPA with Sanctum you may need to
    | customize some of the middleware Sanctum uses while processing the
    | request. You may change the middleware listed below as required.
    |
    */

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
