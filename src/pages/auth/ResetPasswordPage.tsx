import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Layout } from '../../components/layout/Layout';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Password strength analysis
  const passwordStrength = password ? zxcvbn(password) : null;

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      setTokenValid(false);
      return;
    }

    // Validate token
    validateToken(token);
  }, [token]);

  const validateToken = async (resetToken: string) => {
    try {
      // Simulate token validation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any token that's not 'invalid'
      if (resetToken === 'invalid') {
        throw new Error('Invalid token');
      }
      
      setTokenValid(true);
    } catch (err) {
      setError('This reset link is invalid or has expired. Please request a new one.');
      setTokenValid(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-neutral-200';
    
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'bg-error-500';
      case 2:
        return 'bg-warning-500';
      case 3:
        return 'bg-warning-400';
      case 4:
        return 'bg-success-500';
      default:
        return 'bg-neutral-200';
    }
  };

  const getPasswordStrengthText = () => {
    if (!passwordStrength) return '';
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength.score];
  };

  const validateForm = (): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (passwordStrength && passwordStrength.score < 2) {
      return passwordStrength.feedback.warning || 'Password is too weak';
    }
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/', { 
          state: { message: 'Password reset successful. Please sign in with your new password.' }
        });
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Validating reset link...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (tokenValid === false) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-error-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-error-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Invalid Reset Link
              </h1>
              
              <p className="text-neutral-600 mb-6">
                {error}
              </p>
              
              <div className="space-y-3">
                <Link to="/auth/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                Password Reset Successful
              </h1>
              
              <p className="text-neutral-600 mb-6">
                Your password has been successfully reset. You will be redirected to the sign-in page shortly.
              </p>
              
              <Link to="/">
                <Button className="w-full">
                  Continue to Sign In
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-neutral-900">Set New Password</h1>
            <p className="mt-2 text-neutral-600">
              Choose a strong password for your account.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-error-50 text-error-500 p-3 rounded-lg text-sm flex items-start space-x-2"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength ? (passwordStrength.score + 1) * 20 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-600 min-w-[60px]">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    {passwordStrength && passwordStrength.feedback.suggestions.length > 0 && (
                      <div className="mt-1">
                        {passwordStrength.feedback.suggestions.map((suggestion, index) => (
                          <p key={index} className="text-xs text-neutral-500">
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-error-500">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!password || !confirmPassword || password !== confirmPassword}
              >
                Reset Password
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>

          <p className="text-center text-sm text-neutral-600">
            © {new Date().getFullYear()} Volt AI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};