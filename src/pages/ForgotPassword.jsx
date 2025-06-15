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
import { Loader2Icon, ArrowLeft } from "lucide-react";
import DotGrid from '@/block/Backgrounds/DotGrid/DotGrid';

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
      } 
      if (result.status !== 'complete') {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || 'Invalid code or password.');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="overflow-hidden flex relative items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 bg-opacity-90 px-4 py-8 sm:px-6 md:py-12">
      <div className="absolute inset-0 z-0 h-full w-full animate-gradient-slow">
        <DotGrid className="h-full w-full" 
          dotSize={3}             
          gap={24}                
          baseColor="#E5E7EB"     
          activeColor="#4B5563"   
          proximity={120}         
          shockRadius={200}       
          shockStrength={2.5}     
          resistance={900}        
          returnDuration={1.8}/>
      </div>    
        <Toaster richColors position="top-center" expand={false} />  
      <div className="relative z-10 w-full max-w-lg">
        <Card className="relative w-full gap-0.5 shadow-xl z-10 bg-white/90 backdrop-blur-md border border-gray-200 overflow-hidden rounded-xl ring-1 ring-gray-50 transition-all hover:shadow-gray-200/50">
        <CardHeader className="px-5 sm:px-6 pt-8 pb-4 bg-gradient-to-b from-white to-gray-50/30">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Reset Your Password</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2 text-center text-gray-600">
            {step === 1 ? 
              "Enter your email to receive a password reset code" : 
              `Enter the verification code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="grid gap-2 sm:gap-3">                <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all rounded-md"
                  required
                />
              </div>              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base bg-gray-800 hover:bg-black transition-all shadow-md hover:shadow-lg hover:shadow-gray-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
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
                <Label htmlFor="resetCode" className="text-sm sm:text-base font-medium text-gray-700">Verification Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter the code sent to your email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all rounded-md"
                  required
                />
              </div>
              <div className="grid gap-2 sm:gap-3">                
                <Label htmlFor="newPassword" className="text-sm sm:text-base font-medium text-gray-700">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="•••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all rounded-md"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>              
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base bg-gray-800 hover:bg-black transition-all shadow-md hover:shadow-lg hover:shadow-gray-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
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
        <CardFooter className="flex-col px-5 sm:px-6 pt-0 bg-gradient-to-b from-white/5 to-gray-50/20">
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              className="text-sm sm:text-base text-gray-500 hover:text-gray-700 mt-0 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => navigate('/signin')}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Back to Sign In
            </Button>
          </div>
        </CardFooter>      
        </Card>
      </div>
    </div>
  );
};