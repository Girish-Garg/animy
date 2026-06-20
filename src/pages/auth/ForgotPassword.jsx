import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Loader2Icon, ArrowLeft, MailIcon, LockIcon, KeyRoundIcon } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import IconInput from "@/components/auth/IconInput";
import { clerkErrorMessage } from "@/lib/clerkError";

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    setIsLoading(true);
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      toast.success('A verification code has been sent to your email.');
      setStep(2);
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'Failed to send reset code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });
      if (result.status === 'complete') {
        toast.success('Password reset successfully. You can now log in.');
        setTimeout(() => navigate('/signin'), 1000);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'Invalid code or password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="lg">
      <Card
        className="relative w-full shadow-2xl overflow-hidden rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl"
        style={{ background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)' }}
      >
        <CardHeader className="px-5 sm:px-8 pt-8 pb-4 border-b border-blue-900/20">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Reset Your Password</CardTitle>
          <p className="text-center text-gray-300 mt-2 text-sm">
            {step === 1
              ? "Enter your email to receive a password reset code"
              : `Enter the verification code sent to ${email}`}
          </p>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <IconInput
                id="email"
                label="Email"
                icon={<MailIcon size={18} />}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-12 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.99] rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                    Sending code...
                  </>
                ) : "Send Reset Code"}
              </Button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <IconInput
                id="resetCode"
                label="Verification Code"
                icon={<KeyRoundIcon size={18} />}
                type="text"
                placeholder="Enter the code sent to your email"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
              <div>
                <IconInput
                  id="newPassword"
                  label="New Password"
                  icon={<LockIcon size={18} />}
                  type="password"
                  placeholder="•••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs sm:text-sm text-blue-200/60 mt-1">Must be at least 8 characters</p>
              </div>
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-12 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.99] rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col px-5 sm:px-8 pt-2 pb-6">
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              className="text-sm sm:text-base text-blue-300 hover:text-blue-100 hover:bg-blue-900/30 transition-all rounded-lg"
              onClick={() => navigate('/signin')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
