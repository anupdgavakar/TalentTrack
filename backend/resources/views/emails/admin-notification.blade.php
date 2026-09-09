<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $heading }}</title>
</head>
<body style="margin:0; padding:0; background:#f4f6fb; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e7f1;">
                    <tr>
                        <td style="background:#0b1a3a; padding:24px 32px;">
                            <span style="color:#ffffff; font-size:15px; font-weight:700; letter-spacing:0.02em;">Talent Track Technologies</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 8px; font-size:20px; color:#0b1a3a;">{{ $heading }}</h1>
                            <p style="margin:0 0 24px; font-size:14px; color:#6b7286; line-height:1.6;">{{ $intro }}</p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                @foreach ($fields as $label => $value)
                                    @if (filled($value))
                                        <tr>
                                            <td style="padding:10px 0; border-bottom:1px solid #e2e7f1; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#6b7286; width:130px; vertical-align:top;">
                                                {{ $label }}
                                            </td>
                                            <td style="padding:10px 0; border-bottom:1px solid #e2e7f1; font-size:14px; color:#1a1f2e; white-space:pre-line;">
                                                {{ $value }}
                                            </td>
                                        </tr>
                                    @endif
                                @endforeach
                            </table>

                            @if ($ctaLabel && $ctaUrl)
                                <table role="presentation" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="border-radius:8px; background:#1d6be0;">
                                            <a href="{{ $ctaUrl }}" style="display:inline-block; padding:12px 24px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none;">
                                                {{ $ctaLabel }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px; background:#f9fafc; border-top:1px solid #e2e7f1;">
                            <p style="margin:0; font-size:12px; color:#9aa1b4;">
                                Automated notification from the Talent Track Technologies admin system. Manage where these are sent from Admin &rsaquo; Settings.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
