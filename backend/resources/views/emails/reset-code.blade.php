<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Code</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(to right, #dc2626, #ea580c);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .code-box {
            background: white;
            border: 2px solid #dc2626;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #dc2626;
            font-family: 'Courier New', monospace;
        }
        .footer {
            background: #374151;
            color: #f3f4f6;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 12px;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
        }
        h1 {
            margin: 0;
            font-size: 28px;
        }
        p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Princess Jaidee Enterprises</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>

        <div class="content">
            <p>Hi {{ $name }},</p>

            <p>We received a request to reset your password. Use the verification code below to proceed with resetting your password:</p>

            <div class="code-box">{{ $code }}</div>

            <p><strong>Important:</strong> This code will expire in 10 minutes.</p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>If you did not request a password reset, please ignore this email and your password will remain unchanged. Your account is secure.</p>
            </div>

            <p>Here's what you need to do:</p>
            <ol>
                <li>Go to the password reset page on our website</li>
                <li>Enter your email address</li>
                <li>Enter the verification code above (6 digits)</li>
                <li>Enter your new password</li>
                <li>Confirm your new password</li>
            </ol>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Thank you,<br>
                <strong>Princess Jaidee Enterprises Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Princess Jaidee Enterprises. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you need help, contact our support team at info@princessjaidee.com</p>
        </div>
    </div>
</body>
</html>
