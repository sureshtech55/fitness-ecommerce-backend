const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Generate 6 digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Email OTP using Nodemailer
const sendEmailOtp = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn(`[SIMULATION MODE] To: ${email} | OTP: ${otp}`);
      return { success: true, simulated: true, otp };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Login",
      html: `<h2>Your OTP is: <strong>${otp}</strong></h2><p>This code will expire in 5 minutes. Do not share it with anyone.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed", error);
    throw new Error("Failed to send Email OTP");
  }
};

// Send WhatsApp OTP using Twilio (or mock)
const sendWhatsAppOtp = async (phone, otp) => {
  try {
    // Format phone number to E.164 if needed (assuming India +91 as default for e-commerce)
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.warn(`[SIMULATION MODE] WhatsApp to: ${formattedPhone} | OTP: ${otp}`);
      return { success: true, simulated: true, otp };
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your verification code is: ${otp}. This code expires in 5 minutes.`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    });

    return true;
  } catch (error) {
    console.error("WhatsApp sending failed", error);
    throw new Error("Failed to send WhatsApp OTP");
  }
};

// Send SMS OTP using Twilio
const sendSmsOtp = async (phone, otp) => {
  try {
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn(`[SIMULATION MODE] SMS to: ${formattedPhone} | OTP: ${otp}`);
      return { success: true, simulated: true, otp };
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your verification code is: ${otp}. This code expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    return true;
  } catch (error) {
    console.error("SMS sending failed", error);
    throw new Error("Failed to send SMS OTP");
  }
};

module.exports = {
  generateOtp,
  sendEmailOtp,
  sendWhatsAppOtp,
  sendSmsOtp
};
