import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Toaster, toast } from 'sonner';
import { AlertCircleIcon, ArrowLeft, Loader2Icon } from "lucide-react"
import googleSvg from "@/assets/google-logo.svg";
import DotGrid from '@/block/Backgrounds/DotGrid/DotGrid';

export default function SignUp() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred with Google sign up.');
    }
  }

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
        toast.error('Verification failed, please try again.');
        return;
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        console.log(JSON.stringify(completeSignUp, null, 2));
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred during email verification.');
    } finally {
      setIsLoading(false);
    }
  }
  const handleResendCode = async () => {
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      alert('Verification code resent to your email');
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      toast.error(err.errors ? err.errors[0].longMessage : 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };
    return (
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
      <div className="relative z-10 w-full max-w-md">
        {!pendingVerification ? (
          <Card className="relative w-full shadow-xl z-10 bg-white/90 backdrop-blur-md border border-gray-200 overflow-hidden rounded-xl ring-1 ring-gray-50 transition-all hover:shadow-gray-200/50">
            <CardHeader className="px-5 sm:px-6 pt-8 pb-4 bg-gradient-to-b from-white to-gray-50/30">          
              <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Create your account</CardTitle>
            </CardHeader>
            <CardContent className="px-5 sm:px-6">
              <form onSubmit={handleSignUpSubmit}>
                <div className="flex flex-col gap-7">
                  <div className="grid gap-2 sm:gap-3">
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all rounded-md"
                      required
                    />
                  </div>                
                  <div className="grid gap-2 sm:gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all rounded-md"
                      required
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>
                </div>
                <div id="clerk-captcha" />
                <div className="mt-6 sm:mt-8">
                  <Button
                    type="submit"
                    className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base bg-gray-800 hover:bg-black transition-all shadow-md hover:shadow-lg hover:shadow-gray-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? <>
                      <Loader2Icon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                      Please wait
                    </> : "Sign Up"}
                  </Button>
                </div>
              </form>
            </CardContent>        
            <CardFooter className="flex-col gap-3 sm:gap-4 px-5 sm:px-6 bg-gradient-to-b from-white/5 to-gray-50/20">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200 shadow-sm"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 py-0.5 text-gray-500 font-medium tracking-wider rounded-full shadow-sm">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-100 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 text-gray-700"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                type="button"
              >
                <img src={googleSvg} alt="Google" className='size-4 sm:size-5'/>
                Sign up with Google
              </Button>
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-sm sm:text-base text-gray-600">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-gray-600 hover:text-gray-900 font-medium hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>) : (      
          <Card className="relative w-full shadow-xl z-10 bg-white/90 backdrop-blur-md border border-gray-200 overflow-hidden rounded-xl ring-1 ring-gray-50 transition-all hover:shadow-gray-200/50">
            <CardHeader className="px-5 sm:px-6 pt-8 pb-4 bg-gradient-to-b from-white to-gray-50/30">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Verify your email</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-center text-gray-600">
                We've sent a verification code to {emailAddress}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 sm:px-6">
              <form onSubmit={handleEmailVerify}>
                <div className="flex flex-col gap-7">              
                  <div className="grid gap-2 sm:gap-3">
                    <Label htmlFor="code" className="text-sm sm:text-base font-medium text-gray-700">Verification Code</Label>
                    <div className="flex justify-center items-stretch py-1">
                      <div className="w-full">                        
                        <InputOTP
                          maxLength={6}
                          className="w-full justify-center"
                          value={code}
                          onChange={setCode}
                          id="code"
                          required
                        >
                          <InputOTPGroup>
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={0} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={1} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator className="mx-1 sm:mx-2 text-gray-400" />
                          <InputOTPGroup>
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={3} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={4} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-400 bg-white/80 focus:bg-white hover:bg-gradient-to-r hover:from-white/90 hover:to-white transition-all" index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center break-words whitespace-normal">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-4 !max-h-screen">              
                  <Button
                    type="submit"
                    className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base bg-gray-800 hover:bg-black transition-all shadow-md hover:shadow-lg hover:shadow-gray-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? <>
                      <Loader2Icon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                      Please wait
                      </> : "Verify Email"}
                  </Button>              
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-2 sm:mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full sm:w-auto text-sm sm:text-base text-gray-500 hover:text-gray-700 hover:cursor-pointer transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      onClick={() => setPendingVerification(false)}
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                      Back to Sign Up
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full pr-2 sm:w-auto text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:cursor-pointer hover:underline transition-colors"
                      onClick={handleResendCode}
                      disabled={isLoading}
                    >
                      Resend code
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
    </div>
  </div>
  );
}