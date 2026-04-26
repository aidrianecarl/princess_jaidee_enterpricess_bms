<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    // Generate a 6-digit code and send to email
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found with this email address'
            ], 404);
        }

        // Generate a 6-digit code
        $resetCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Update user with reset code (valid for 10 minutes)
        $user->reset_code = $resetCode;
        $user->reset_code_expires_at = now()->addMinutes(10);
        $user->reset_code_attempts = 0;
        $user->last_password_reset_request_at = now();
        $user->save();

        // Send email with the code
        try {
            Mail::send('emails.reset-code', [
                'name' => $user->first_name,
                'code' => $resetCode
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Password Reset Code - Princess Jaidee Enterprises');
            });

            return response()->json([
                'success' => true,
                'message' => 'Reset code has been sent to your email address'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email. Please try again later.'
            ], 500);
        }
    }

    // Verify the reset code
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|size:6|numeric'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check if code has expired
        if (!$user->reset_code_expires_at || now()->isAfter($user->reset_code_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Reset code has expired. Please request a new one.'
            ], 400);
        }

        // Check if code matches
        if ($user->reset_code !== $request->code) {
            // Increment attempts
            $user->reset_code_attempts = ($user->reset_code_attempts ?? 0) + 1;

            // Lock account after 3 failed attempts
            if ($user->reset_code_attempts >= 3) {
                $user->reset_code = null;
                $user->reset_code_expires_at = null;
                $user->reset_code_attempts = 0;
            }
            $user->save();

            $attempts = 3 - $user->reset_code_attempts;
            return response()->json([
                'success' => false,
                'message' => $attempts > 0 
                    ? "Invalid code. {$attempts} attempt(s) remaining."
                    : 'Too many failed attempts. Please request a new reset code.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Code verified successfully'
        ]);
    }

    // Reset password after code verification
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|size:6|numeric',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Verify code one more time
        if ($user->reset_code !== $request->code) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid reset code'
            ], 400);
        }

        // Check if code has expired
        if (!$user->reset_code_expires_at || now()->isAfter($user->reset_code_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Reset code has expired'
            ], 400);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->reset_code = null;
        $user->reset_code_expires_at = null;
        $user->reset_code_attempts = 0;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully'
        ]);
    }
}
