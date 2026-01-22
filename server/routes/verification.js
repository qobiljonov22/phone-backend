// Phone number verification with OTP (One-Time Password)
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';

const router = express.Router();

// OTP storage file
// In Vercel/serverless, use /tmp directory for file writes
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const otpFile = isVercel ? '/tmp/otp_database.json' : 'otp_database.json';

// Load OTPs from file
const loadOTPs = () => {
  try {
    if (fs.existsSync(otpFile)) {
      return JSON.parse(fs.readFileSync(otpFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading OTPs:', error);
  }
  return { otps: [] };
};

// Save OTPs to file
const saveOTPs = (data) => {
  try {
    // Ensure data structure is correct
    if (!data.otps) {
      data.otps = [];
    }
    
    // Add metadata
    data.metadata = {
      lastUpdated: new Date().toISOString(),
      totalOTPs: data.otps.length,
      verifiedOTPs: data.otps.filter(o => o.verified).length,
      activeOTPs: data.otps.filter(o => !o.verified && new Date(o.expiresAt).getTime() > Date.now()).length
    };
    
    // Sort by creation date (newest first)
    data.otps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Save to JSON file with proper formatting
    fs.writeFileSync(otpFile, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ OTP data saved to ${otpFile} (${data.otps.length} OTPs, ${data.metadata.activeOTPs} active)`);
    return true;
  } catch (error) {
    console.error('❌ Error saving OTPs:', error);
    throw error;
  }
};

// Generate 6-digit OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
const sendOTP = async (phone, code, isDevelopment = true) => {
  try {
    if (isDevelopment || process.env.NODE_ENV === 'development') {
      // Development mode: Log to console and return code
      console.log(`📱 SMS sent to ${phone}: Your verification code is ${code}`);
      console.log(`🔐 OTP Code: ${code} (Valid for 5 minutes)`);
      
      // In development, also return the code so client can see it
      return { success: true, code: code, mode: 'development' };
    } else {
      // Production mode: Send real SMS
      // Example with Twilio (uncomment and configure):
      /*
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require('twilio')(accountSid, authToken);
      
      const message = await client.messages.create({
        body: `Your verification code is: ${code}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      
      return { success: true, messageId: message.sid, mode: 'production' };
      */
      
      // For now, log in production too (replace with real SMS service)
      console.log(`📱 [PRODUCTION] SMS should be sent to ${phone}: ${code}`);
      return { success: true, code: code, mode: 'production_log' };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// ========== SEND OTP ==========
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  
  // Validation
  if (!phone) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone number is required',
      message: 'Telefon raqami kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Phone number format validation (Uzbekistan format)
  const phoneRegex = /^\+998[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Invalid phone number format',
      message: 'Noto\'g\'ri telefon raqam formati. Format: +998901234567',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const data = loadOTPs();
  
  // Initialize otps array if not exists
  if (!data.otps) {
    data.otps = [];
  }
  
  // Remove expired OTPs (cleanup)
  const now = Date.now();
  const beforeCleanup = data.otps.length;
  data.otps = data.otps.filter(otp => {
    const expiresAt = new Date(otp.expiresAt).getTime();
    return expiresAt > now;
  });
  
  // Save cleaned data if expired OTPs were removed
  if (beforeCleanup !== data.otps.length) {
    saveOTPs(data);
  }
  
  // Check if OTP was sent recently (rate limiting - max 1 per minute)
  const recentOTP = data.otps.find(otp => 
    otp.phone === phone && 
    (now - new Date(otp.createdAt).getTime()) < 60000 // 1 minute
  );
  
  if (recentOTP) {
    return res.status(429).json({
      success: false,
      status: 'rate_limit',
      error: 'OTP already sent. Please wait 1 minute before requesting again.',
      message: 'Tasdiqlash kodi allaqachon yuborilgan. Iltimos, 1 daqiqa kutib turing.',
      retryAfter: 60,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Generate OTP
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  const otp = {
    id: `otp_${Date.now()}`,
    phone,
    code: otpCode,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    verified: false,
    attempts: 0,
    ipAddress: req.ip || req.connection.remoteAddress
  };
  
  // Save OTP to JSON file
  data.otps.push(otp);
  saveOTPs(data);
  
  // Send OTP via SMS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const smsResult = await sendOTP(phone, otpCode, isDevelopment);
  
  // Prepare response data
  const responseData = {
    phone: phone,
    expiresIn: '5 minutes',
    message: 'OTP code sent successfully'
  };
  
  // In development mode, include code in response (for testing)
  if (isDevelopment && smsResult.success && smsResult.code) {
    responseData.code = smsResult.code;
    responseData.note = 'Development mode: Code shown in response. In production, code will be sent via SMS only.';
  }
  
  res.json({
    success: true,
    status: 'sent',
    data: responseData,
    message: 'Tasdiqlash kodi telefon raqamingizga yuborildi. Kod 5 daqiqa davomida amal qiladi.',
    links: {
      verify: `${req.protocol}://${req.get('host')}/api/verification/verify-otp`,
      resend: `${req.protocol}://${req.get('host')}/api/verification/send-otp`
    },
    meta: {
      mode: isDevelopment ? 'development' : 'production',
      expiresAt: expiresAt.toISOString(),
      sentAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== VERIFY OTP ==========
router.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  
  // Validation
  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      error: 'Phone number and OTP code are required',
      message: 'Telefon raqami va tasdiqlash kodi kiritilishi shart',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const data = loadOTPs();
  const now = Date.now();
  
  // Find OTP for this phone
  const otp = data.otps.find(o => 
    o.phone === phone && 
    !o.verified &&
    new Date(o.expiresAt).getTime() > now
  );
  
  if (!otp) {
    return res.status(404).json({
      success: false,
      status: 'not_found',
      error: 'OTP not found or expired',
      message: 'Tasdiqlash kodi topilmadi yoki muddati o\'tgan. Yangi kod so\'rang.',
      links: {
        resend: `${req.protocol}://${req.get('host')}/api/verification/send-otp`
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Check attempts (max 5 attempts)
  if (otp.attempts >= 5) {
    return res.status(429).json({
      success: false,
      status: 'max_attempts',
      error: 'Maximum verification attempts exceeded',
      message: 'Maksimal urinishlar soni oshib ketdi. Yangi kod so\'rang.',
      links: {
        resend: `${req.protocol}://${req.get('host')}/api/verification/send-otp`
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Verify code
  if (otp.code !== code) {
    otp.attempts += 1;
    saveOTPs(data);
    
    return res.status(400).json({
      success: false,
      status: 'invalid_code',
      error: 'Invalid OTP code',
      message: 'Noto\'g\'ri tasdiqlash kodi',
      data: {
        attempts: otp.attempts,
        remainingAttempts: 5 - otp.attempts
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Mark as verified
  otp.verified = true;
  otp.verifiedAt = new Date().toISOString();
  saveOTPs(data);
  
  res.json({
    success: true,
    status: 'verified',
    data: {
      phone: phone,
      verified: true,
      verifiedAt: otp.verifiedAt
    },
    message: 'Telefon raqam muvaffaqiyatli tasdiqlandi',
    links: {
      register: `${req.protocol}://${req.get('host')}/api/auth/register`,
      login: `${req.protocol}://${req.get('host')}/api/auth/login`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== CHECK VERIFICATION STATUS ==========
router.get('/status/:phone', (req, res) => {
  const { phone } = req.params;
  
  const data = loadOTPs();
  const now = Date.now();
  
  // Find latest OTP for this phone
  const otps = data.otps.filter(o => o.phone === phone);
  const latestOTP = otps.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )[0];
  
  if (!latestOTP) {
    return res.json({
      success: true,
      status: 'ok',
      data: {
        phone: phone,
        verified: false,
        hasOTP: false
      },
      message: 'Tasdiqlash kodi yuborilmagan',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  const isExpired = new Date(latestOTP.expiresAt).getTime() < now;
  const isVerified = latestOTP.verified;
  
  res.json({
    success: true,
    status: 'ok',
    data: {
      phone: phone,
      verified: isVerified,
      hasOTP: !isExpired,
      expiresAt: latestOTP.expiresAt,
      attempts: latestOTP.attempts,
      createdAt: latestOTP.createdAt
    },
    message: isVerified 
      ? 'Telefon raqam tasdiqlangan' 
      : isExpired 
        ? 'Tasdiqlash kodi muddati o\'tgan' 
        : 'Tasdiqlash kodi yuborilgan',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
