
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@animy.tech',
    pass: 'faBwrXKSTg3K'
  }
});

/**
 * Send a success email when a video is ready.
 * @param {string} sendTo - Recipient email address
 * @param {string} prompt - The animation prompt
 * @param {string} chatUrl - The chat URL
 * @returns {Promise<void>}
 */
export async function sendSuccessMail(sendTo, prompt, chatUrl) {
  const mailOptions = {
    from: 'AnimY <contact@animy.tech>',
    to: sendTo,
    subject: 'Your AnimY Video is Ready',
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    },
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>AnimY – Video Ready</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Segoe UI', sans-serif;
      color: #1a1a1a;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      padding: 48px 20px;
      text-align: center;
    }
    .logo {
      width: 52px;
      margin-bottom: 28px;
    }
    .heading {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111;
    }
    .subtext {
      font-size: 15px;
      color: #555;
      margin-bottom: 16px;
    }
    .prompt-box {
      background-color: #6d6d6d;
      color: #ffffff;
      padding: 10px 18px;
      font-size: 14px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 24px;
    }
    .note {
      font-size: 14px;
      color: #777;
      line-height: 1.5;
      margin-bottom: 32px;
    }

    .cta-button {
      display: inline-block;
      padding: 10px 22px;
      background-color: black;
      color: #fff;
      font-size: 14px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 5px rgba(124, 58, 237, 0.25);
    }
    .cta-button:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .footer {
      font-size: 13px;
      color: #888888;
      margin-top: 40px;
    }
    .footer a {
      color: #7c3aed;
      text-decoration: none !important;
    }
  </style>
</head>
<body>
  <div class="container">
  <div style="overflow: hidden; width: 100%; height: 200px; object-fit: contain; ">
    <img src="https://app.animy.tech/final.png"  height="200" alt="AnimY Logo" class="logo" 
    style="object-fit: cover; width: 300px;"/>
    </div>
    <div class="heading">Your video is ready</div>
    <div class="subtext">The video for your animation prompt:</div>

    <div class="prompt-box">${prompt}</div>

    <div class="note">
      has been successfully generated.<br>
      You can now view, edit, or download it from the chat interface.
    </div>

    <a href="${chatUrl}"  target="_blank"><button class="cta-button">Open Chat</button></a>

    <div class="footer">
      Need help? <a href="mailto:contact@animy.tech">Contact Support</a>
    </div>
  </div>
</body>
</html>
`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve();
      }
    });
  });
}
