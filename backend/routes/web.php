<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

// This backend is a pure REST API (see routes/api.php, wired up in Phase 3/4).
// The root route is only a human-readable health check — the React SPA in
// /frontend is the actual public website.
Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => 'Talent Track Technologies API',
    ]);
});

// Plain XML, not the api/* JSON envelope — search engines expect it at
// this exact path. See SitemapController's docblock for why it lives here
// (not routes/api.php) and how it relates to frontend/public/robots.txt.
Route::get('/sitemap.xml', SitemapController::class);
