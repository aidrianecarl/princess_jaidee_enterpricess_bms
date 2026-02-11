<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            \Log::error('Contact form validation failed:', $validator->errors()->toArray());
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        try {
            $emailData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone ?? '',
                'subject' => $request->subject,
                'body' => $request->message, 
            ];


            \Log::info('Sending contact email with data:', $emailData);

            // Send email to Princess Jaidee's email
            Mail::send('emails.contact', $emailData, function ($message) use ($emailData) {
                $message->to('aidrianecarlesmena@gmail.com')
                        ->subject('New Contact Form Submission: ' . $emailData['subject']);
            });


            // Send a confirmation email to the sender
            Mail::send('emails.contact-confirmation', $emailData, function ($message) use ($emailData) {
                $message->to($emailData['email'])
                        ->subject('Thank You for Contacting Princess Jaidee Enterprises');
            });


            \Log::info('Contact emails sent successfully');

            return response()->json([
                'message' => 'Message sent successfully!',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Contact form error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Failed to send message. Please try again later. Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
