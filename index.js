//  Includes Database
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure rate limiting
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many submissions from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure slower rate limiter for newsletter
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false, 
    message: "Too many subscription attempts, please try again later"
  }
});



app.use(express.static(path.join(__dirname, "crossFile")));
app.use("/crossFile", express.static(path.join(__dirname, "crossFile")));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "homePage")));
app.use("/about", express.static(path.join(__dirname, "aboutPage")));
app.use("/contact", express.static(path.join(__dirname, "contactPage")));
app.use("/pre-order", express.static(path.join(__dirname, "preorderPage")));
app.use("/services", express.static(path.join(__dirname, "servicesPage")));



app.use(
  "/services",
  express.static(path.join(__dirname, "public/servicesPage")),
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "exceeltrcode@gmail.com",
    pass: process.env["emailPassword"],
  },
});


// Email handling routes
app.post("/api/contact", formLimiter, async (req, res) => {
  try {
    const { name, email, company, phone, inquiry, message, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: "Please complete the reCAPTCHA verification" });
    }

    try {
      const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

      const verifyResponse = await axios.post(verifyURL);

      console.log('reCAPTCHA Response:', verifyResponse.data); // Debug log

      if (!verifyResponse.data.success) {
        console.error('reCAPTCHA failed:', verifyResponse.data['error-codes']);
        return res.status(400).json({ 
          success: false, 
          message: "reCAPTCHA verification failed. Please try again.",
          debug: verifyResponse.data['error-codes'] // Temporary debug info
        });
      }
    } catch (recaptchaError) {
      console.error("reCAPTCHA verification error:", recaptchaError);
      return res.status(500).json({ success: false, message: "Failed to verify reCAPTCHA. Please try again." });
    }

    // Input fields validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }
    
    // Length limits to prevent abuse
    if (message.length > 5000) {
      return res.status(400).json({ success: false, message: "Message is too long. Please limit to 5000 characters." });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ success: false, message: "Name is too long. Please limit to 100 characters." });
    }
    
    // Set up email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "riley@circularsupply.org",
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 25px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #00b075;
              color: white;
              padding: 15px;
              border-radius: 5px 5px 0 0;
              margin: -25px -25px 20px -25px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 0.8em;
              text-align: center;
              color: #666;
            }
            h2 { color: #00b075; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; }
            .message-box {
              background-color: white;
              border: 1px solid #e0e0e0;
              border-radius: 3px;
              padding: 15px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            
            <h2>Contact Details</h2>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            
            ${company ? `
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            
            ${phone ? `
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${phone}</div>
            </div>
            ` : ''}
            
            ${inquiry ? `
            <div class="field">
              <div class="label">Inquiry Type:</div>
              <div class="value">${inquiry}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="footer">
              This email was sent from the contact form on Circular Supply Inc website.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    // Additional headers to avoid spam filters
    mailOptions.headers = {
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'Auto-Submitted': 'auto-generated',
      'X-Priority': '3',
      'Importance': 'normal'
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
});

app.post("/api/newsletter", newsletterLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    
    // Set up email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "exceeltrcode@gmail.com",
      to: "riley@circularsupply.org",
      subject: "New Newsletter Subscription",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 25px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #00b075;
              color: white;
              padding: 15px;
              border-radius: 5px 5px 0 0;
              margin: -25px -25px 20px -25px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 0.8em;
              text-align: center;
              color: #666;
            }
            h2 { color: #00b075; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; }
            .email-highlight {
              background-color: white;
              border: 1px solid #e0e0e0;
              border-radius: 3px;
              padding: 10px;
              font-size: 1.1em;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Newsletter Subscription</h1>
            </div>
            
            <h2>Subscription Details</h2>
            
            <div class="field">
              <div class="label">Email Address:</div>
              <div class="value email-highlight">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Date Subscribed:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
            
            <div class="footer">
              This email was sent from the newsletter subscription form on Circular Supply Inc website.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    // Additional headers to avoid spam filters
    mailOptions.headers = {
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'Auto-Submitted': 'auto-generated',
      'X-Priority': '3',
      'Importance': 'normal'
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: "Thanks for subscribing to our newsletter!" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({ success: false, message: "Failed to subscribe. Please try again later." });
  }
});

// Handle pre-order form submissions
app.post("/api/preorder", formLimiter, async (req, res) => {
  try {
    const { name, company, email, phone, address, quantity, total, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: "Please complete the reCAPTCHA verification" });
    }

    try {
      const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

      const verifyResponse = await axios.post(verifyURL);

      console.log('Pre-order reCAPTCHA Response:', verifyResponse.data); // Debug log

      if (!verifyResponse.data.success) {
        console.error('Pre-order reCAPTCHA failed:', verifyResponse.data['error-codes']);
        return res.status(400).json({ 
          success: false, 
          message: "reCAPTCHA verification failed. Please try again."
        });
      }
    } catch (recaptchaError) {
      console.error("Pre-order reCAPTCHA verification error:", recaptchaError);
      return res.status(500).json({ success: false, message: "Failed to verify reCAPTCHA. Please try again." });
    }
    
    // Set up email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "exceeltrcode@gmail.com",
      to: "riley@circularsupply.org",
      subject: `New Pre-Order from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 25px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #00b075;
              color: white;
              padding: 15px;
              border-radius: 5px 5px 0 0;
              margin: -25px -25px 20px -25px;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 0.8em;
              text-align: center;
              color: #666;
            }
            h2 { color: #00b075; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; }
            .price-box {
              background-color: #f2f9f4;
              border: 1px solid #c8e4d0;
              border-left: 4px solid #00b075;
              padding: 15px;
              margin-top: 20px;
              border-radius: 3px;
            }
            .total-price {
              font-size: 1.2em;
              font-weight: bold;
              color: #00b075;
            }
            .address-box {
              background-color: white;
              border: 1px solid #e0e0e0;
              border-radius: 3px;
              padding: 15px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Green Goat Gloves Pre-Order</h1>
            </div>
            
            <h2>Order Details</h2>
            
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${company}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${phone}</div>
            </div>
            
            <div class="field">
              <div class="label">Shipping Address:</div>
              <div class="value address-box">${address.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="price-box">
              <div class="field">
                <div class="label">Quantity:</div>
                <div class="value">${quantity} pairs</div>
              </div>
              
              <div class="field">
                <div class="label">Total Order Value:</div>
                <div class="value total-price">$${total}</div>
              </div>
            </div>
            
            <div class="footer">
              This email was sent from the pre-order form on Circular Supply Inc website.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    // Additional headers to avoid spam filters
    mailOptions.headers = {
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'Auto-Submitted': 'auto-generated',
      'X-Priority': '3',
      'Importance': 'normal'
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: "Your pre-order has been received! We'll contact you soon to confirm the details." });
  } catch (error) {
    console.error("Pre-order form error:", error);
    res.status(500).json({ success: false, message: "Failed to submit pre-order. Please try again later." });
  }
});

app.listen(3000, async () => {
  console.log("Starting server...");
  console.log(`Server running on port 3000`);
});