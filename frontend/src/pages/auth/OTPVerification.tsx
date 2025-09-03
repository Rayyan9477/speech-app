import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../lib/theme-provider';
import { ArrowLeft, Mail, Clock } from 'lucide-react';

const OTPVerification = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      console.log('OTP submitted:', otpCode);
      // Navigate to main app after successful verification
      navigate('/app');
    }
  };

  const handleResendOTP = () => {
    setTimeLeft(300);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    // Handle resend OTP logic here
    console.log('OTP resent');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      {/* Header */}
      <header className="p-6">
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md text-center"
        >
          {/* Icon */}
          <motion.div
            variants={itemVariants}
            className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Verify Your Email
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-8 leading-relaxed"
          >
            We've sent a 6-digit verification code to your email address.
            Please enter it below to continue.
          </motion.p>

          {/* OTP Input */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="mb-8"
          >
            <div className="flex justify-center space-x-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  maxLength={1}
                  required
                  placeholder="0"
                  aria-label={`OTP digit ${index + 1}`}
                  title={`Enter digit ${index + 1} of verification code`}
                />
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg"
              disabled={otp.some(digit => !digit)}
            >
              Verify Email
            </Button>
          </motion.form>

          {/* Timer and Resend */}
          <motion.div variants={itemVariants} className="space-y-4">
            {!canResend ? (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Resend code in {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-primary hover:underline font-medium"
              >
                Didn't receive the code? Resend
              </button>
            )}

            <div className="text-xs text-muted-foreground">
              <p>Check your spam folder if you don't see the email</p>
              <p>Wrong email? <button className="text-primary hover:underline">Change email address</button></p>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step === 0
                      ? 'bg-primary'
                      : step === 1
                      ? 'bg-primary/50'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Step 2 of 3</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default OTPVerification;
