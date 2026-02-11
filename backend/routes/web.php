<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;


Route::post('/contact', [ContactController::class, 'sendMessage']);
// Route::get('/test-contact-email', function () {
//     $data = [
//         'name' => 'Aidriane',
//         'email' => 'aidriane1233@gmail.com',
//         'phone' => '1234567890',
//         'subject' => 'Testing Email',
//         'body' => 'This is a test message from Laravel.'
//     ];

//     \Mail::send('emails.contact', $data, function ($message) use ($data) {
//         $message->to('aidrianecarlesmena@gmail.com') // Replace with your email
//                 ->subject('New Contact Form Submission: ' . $data['subject']);
//     });

//     return 'Test email sent!';
// });


Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';
