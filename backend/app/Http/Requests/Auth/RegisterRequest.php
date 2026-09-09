<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // registration is public
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            // Phase 13: was a bare `min:8`, which "12345678" or "aaaaaaaa"
            // satisfied. Laravel's own Password rule object adds a
            // letters+numbers requirement on top of the same 8-character
            // minimum — deliberately not going further (no symbols, no
            // ->uncompromised() breach-database check) to keep the bar
            // "meaningfully better than before" rather than turning
            // registration into a frustrating form; ->uncompromised() also
            // calls an external API (Have I Been Pwned) on every signup,
            // which isn't a dependency worth adding to the registration
            // path without being asked for it.
            'password' => ['required', Password::min(8)->letters()->numbers(), 'confirmed'],
        ];
    }
}
