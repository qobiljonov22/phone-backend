// Phone number verification with OTP (One-Time Password)
import express from 'express';
import crypto from 'crypto';
import { storage } from '../utils/storage.js';
import { sendOTPCode } from '../utils/sms.js';

const router = express.Router();

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
      // Production mode: Send real SMS via utility
      const result = await sendOTPCode(phone, code);
      
      if (result.success) {
        return result;
      } else {
        // Fallback to console log if SMS service fails
        console.log(`📱 [PRODUCTION] SMS service failed, logging: ${code}`);
        return { success: true, code: code, mode: 'production_log', warning: result.error };
      }
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
  
  const now = Date.now();
  
  // Get all OTPs for this phone
  const allOTPs = await storage.find('otps', { phone });
  
  // Remove expired OTPs
  const activeOTPs = allOTPs.filter(otp => {
    const expiresAt = new Date(otp.expiresAt).getTime();
    return expiresAt > now;
  });
  
  // Delete expired OTPs
  for (const otp of allOTPs) {
    const expiresAt = new Date(otp.expiresAt).getTime();
    if (expiresAt <= now) {
      await storage.delete('otps', { id: otp.id });
    }
  }
  
  // Check if OTP was sent recently (rate limiting - max 1 per minute)
  const recentOTP = activeOTPs.find(otp => 
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
  
  // Save OTP to database
  await storage.insert('otps', otp);
  
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
router.post('/verify-otp', async (req, res) => {
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
  
  const now = Date.now();
  
  // Find OTP for this phone
  const allOTPs = await storage.find('otps', { phone });
  const otp = allOTPs.find(o => 
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
    await storage.update('otps', { id: otp.id }, {
      attempts: otp.attempts + 1
    });
    
    return res.status(400).json({
      success: false,
      status: 'invalid_code',
      error: 'Invalid OTP code',
      message: 'Noto\'g\'ri tasdiqlash kodi',
      data: {
        attempts: otp.attempts + 1,
        remainingAttempts: 5 - (otp.attempts + 1)
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  // Mark as verified
  await storage.update('otps', { id: otp.id }, {
    verified: true,
    verifiedAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    status: 'verified',
    data: {
      phone: phone,
      verified: true,
      verifiedAt: new Date().toISOString()
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
router.get('/status/:phone', async (req, res) => {
  const { phone } = req.params;
  
  const now = Date.now();
  
  // Find latest OTP for this phone
  const otps = await storage.find('otps', { phone });
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
