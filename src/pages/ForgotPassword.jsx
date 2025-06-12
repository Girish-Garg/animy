import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Loader2Icon, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = ask email, 2 = ask code & new password
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccess('A verification code has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (result.status === 'complete') {
        setSuccess('Password reset successfully. You can now log in.');
        setTimeout(() => {
          navigate('/signin');
        }, 1000);
      } 
      if (result.status !== 'complete') {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid code or password.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8 sm:px-6 md:py-12">
      <Card className="w-full max-w-lg shadow-lg gap-4">
        <CardHeader className="px-5 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2">
            {step === 1 ? 
              "Enter your email to receive a password reset code" : 
              `Enter the verification code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          {error && (
            <Alert variant="destructive" className="py-2 sm:py-3 flex items-baseline mb-6">
              <AlertCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 align-middle"/>
              <AlertDescription className="text-sm sm:text-base ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200 py-2 sm:py-3 flex items-baseline mb-6">
              <AlertDescription className="text-sm sm:text-base">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Sending code...
                  </>
                ) : "Send Reset Code"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="resetCode" className="text-sm sm:text-base font-medium">Verification Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter the code sent to your email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                  required
                />
              </div>
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="•••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col px-5 sm:px-6 pt-0">
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              className="text-sm sm:text-base text-gray-500 hover:text-gray-700 mt-0"
              onClick={() => navigate('/signin')}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Back to Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};