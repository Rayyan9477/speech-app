import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useTheme } from '../../lib/theme-provider';
import { ArrowLeft, Mail, Shield } from 'lucide-react';

const ForgotPassword = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  const handleResendEmail = () => {
    console.log('Resend reset email to:', email);
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
          onClick={() => navigate('/login')}
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
          {!isSubmitted ? (
            <>
              {/* Icon */}
              <motion.div
                variants={itemVariants}
                className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Forgot Password?
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-muted-foreground mb-8 leading-relaxed"
              >
                No worries! Enter your email address and we'll send you a link to reset your password.
              </motion.p>

              {/* Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground text-left block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg"
                >
                  Send Reset Link
                </Button>
              </motion.form>
            </>
          ) : (
            <>
              {/* Success State */}
              <motion.div
                variants={itemVariants}
                className="w-20 h-20 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Check Your Email
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-muted-foreground mb-8 leading-relaxed"
              >
                We've sent a password reset link to{' '}
                <span className="font-medium text-foreground">{email}</span>
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  size="lg"
                  className="w-full h-12 border-border/50 hover:bg-accent rounded-xl"
                >
                  Resend Email
                </Button>

                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-12 text-primary hover:bg-primary/10 rounded-xl"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 p-4 bg-accent/50 rounded-xl"
              >
                <h3 className="font-medium text-foreground mb-2">Didn't receive the email?</h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
              </motion.div>
            </>
          )}

          {/* Help Link */}
          {!isSubmitted && (
            <motion.div variants={itemVariants} className="mt-8">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ForgotPassword;
