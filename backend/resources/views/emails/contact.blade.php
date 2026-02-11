<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .header { background: linear-gradient(to right, #dc2626, #f97316); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .field { margin: 15px 0; }
        .label { font-weight: bold; color: #1a1a1a; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
        .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>

        <div class="content">
            <p>You have received a new message from your contact form:</p>

            <div class="field"><span class="label">Name:</span> {{ $name }}</div>
            <div class="field"><span class="label">Email:</span> {{ $email }}</div>
            <div class="field"><span class="label">Phone:</span> {{ $phone ?? 'Not provided' }}</div>
            <div class="field"><span class="label">Subject:</span> {{ $subject }}</div>

            <div class="message-box">
                <span class="label">Message:</span>
                <p>{{ $body }}</p>
            </div>

            <p style="margin-top: 20px; color: #666;"><strong>Reply to:</strong> {{ $email }}</p>
        </div>

        <div class="footer">
            <p>This is an automated message from Princess Jaidee Enterprises Contact Form</p>
        </div>
    </div>
</body>
</html>
