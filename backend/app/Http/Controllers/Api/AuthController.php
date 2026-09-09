<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Candidate registration/login and session management. This is Sanctum's
 * SPA ("stateful") flow, not token auth: the frontend calls
 * GET /sanctum/csrf-cookie once, then POSTs here with axios'
 * `withCredentials: true` — Laravel issues a normal session cookie, and
 * every subsequent request (including logout/me) is authenticated by that
 * cookie automatically, no token to store or attach by hand.
 *
 * Every account created through /register is a 'candidate' — there is no
 * public admin sign-up. Admin accounts are created directly in the
 * database (see DatabaseSeeder) or, later, by another admin.
 */
class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'password' => Hash::make($request->validated('password')),
            'role' => 'candidate',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return $this->created(new UserResource($user), 'Registered successfully.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials, remember: true)) {
            return $this->error('Invalid email or password.', 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return $this->error('This account has been deactivated.', 403);
        }

        $request->session()->regenerate();

        return $this->success(new UserResource($user), 'Logged in successfully.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success(null, 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }
}
