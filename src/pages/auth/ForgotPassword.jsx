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
import { Toaster, toast } from 'sonner';
import { Loader2Icon, ArrowLeft, MailIcon, LockIcon } from "lucide-react";

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
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      toast.success('A verification code has been sent to your email.');
      setStep(2);
    } catch (err) {
      toast.error(err.errors?.[0]?.message || 'Failed to send reset code.');
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
        setTimeout(() => {
          navigate('/signin');
        }, 1000);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || 'Invalid code or password.');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="overflow-hidden flex relative items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:py-12">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
         
      <div className="absolute inset-0 bg-black/60 z-10" />
      
      <Toaster richColors position="top-center" expand={false} />      <div className="relative z-20 w-full max-w-lg">
        <Card className="relative w-full shadow-2xl overflow-hidden rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl"
              style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)'}}>
        <CardHeader className="px-5 sm:px-8 pt-8 pb-4 border-b border-blue-900/20">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Reset Your Password</CardTitle>
          <p className="text-center text-gray-300 mt-2 text-sm">
            {step === 1 ? 
              "Enter your email to receive a password reset code" : 
              `Enter the verification code sent to ${email}`}
          </p>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-blue-100">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                    <MailIcon size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-sm sm:text-base pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>
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
          )}          {step === 2 && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="grid gap-2 sm:gap-3">                
                <Label htmlFor="resetCode" className="text-sm sm:text-base font-medium text-blue-100">Verification Code</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7.5V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2.5"/><path d="M2 13h10"/><path d="m5 10-3 3 3 3"/></svg>
                  </div>
                  <Input
                    id="resetCode"
                    type="text"
                    placeholder="Enter the code sent to your email"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="h-12 text-sm sm:text-base pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:gap-3">                
                <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium text-blue-100">New Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                    <LockIcon size={18} />
                  </div>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="•••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 text-sm sm:text-base pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                    required
                  />
                </div>
                <p className="text-xs sm:text-sm text-blue-200/60 mt-1">
                  Must be at least 8 characters
                </p>
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
      </div>
    </div>
  );
};