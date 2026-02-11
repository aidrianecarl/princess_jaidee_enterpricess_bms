<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .header {
            background: linear-gradient(to right, #dc2626, #f97316);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            padding: 20px;
            background: #f9fafb;
        }
        .highlight {
            background: white;
            padding: 15px;
            border-left: 4px solid #16a34a;
            margin: 15px 0;
            border-radius: 4px;
        }
        .footer {
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $name }},</p>
            
            <p>We have received your message and appreciate you reaching out to Princess Jaidee Enterprises. Our team will review your inquiry and get back to you as soon as possible.</p>
            
            <div class="highlight">
                <strong>Here's a summary of your submission:</strong>
                <p>
                    <strong>Subject:</strong> {{ $subject }}<br>
                    <strong>Email:</strong> {{ $email }}<br>
                    <strong>Phone:</strong> {{ $phone ?? 'Not provided' }}
                    <strong>Message:</strong> {{ $body }}
                </p>
            </div>
            
            <p>We typically respond to inquiries within 24-48 business hours. If your matter is urgent, please feel free to call us directly.</p>
            
            <p>Thank you for choosing Princess Jaidee Enterprises!</p>
            
            <p style="margin-top: 20px;">
                Best regards,<br>
                <strong>Princess Jaidee Enterprises Team</strong>
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
