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
  };    return (
    <div className="overflow-hidden flex relative items-center justify-center min-h-screen px-4 py-8 sm:px-6 md:py-12">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
        <Toaster richColors position="top-center" expand={false} />
      <div className="relative z-20 w-full max-w-md">        {!pendingVerification ? (
          <Card className="relative w-full shadow-2xl overflow-hidden rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl"
                style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)'}}>
            <CardHeader className="px-5 sm:px-8 pt-8 pb-4 border-b border-blue-900/20">          
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Create your account</CardTitle>
              <p className="text-center text-gray-300 mt-2 text-sm">Register to get started with AnimY</p>
            </CardHeader>
            <CardContent className="px-5 sm:px-6">
              <form onSubmit={handleSignUpSubmit}>                
                <div className="flex flex-col gap-5 sm:gap-6">
                  <div className="grid gap-2 sm:gap-3">
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium text-blue-100">Email</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="h-12 text-sm sm:text-base pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                        required
                      />
                    </div>
                  </div>                
                  <div className="grid gap-2 sm:gap-3">
                    <Label htmlFor="password" className="text-sm sm:text-base font-medium text-blue-100">Password</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder=""
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 text-sm sm:text-base pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                        required
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200/60 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>
                </div>
                <div id="clerk-captcha" />                
                <div className="mt-7 sm:mt-8">
                  <Button
                    type="submit"
                    className="w-full hover:cursor-pointer h-12 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.99] rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                        Please wait
                      </>
                    ) : "Sign Up"}
                  </Button>
                </div>
              </form>
            </CardContent>            
            <CardFooter className="flex-col gap-4 px-5 sm:px-8 pb-8 pt-4">
              <div className="relative w-full my-2">            
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-900/30"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 py-0.5 text-blue-300 font-medium tracking-wider rounded-full bg-[#131631]">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full hover:cursor-pointer h-12 text-base flex items-center justify-center gap-3 bg-[#131631] border-blue-900/30 hover:bg-[#1a1f37]/40 transition-all text-white hover:text-white rounded-xl transform hover:scale-[1.02] active:scale-[0.99]"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                type="button"
              >
                <img src={googleSvg} alt="Google" className='size-5'/>
                Sign up with Google
              </Button>
              <div className="text-center mt-6">
                <p className="text-sm sm:text-base text-blue-200/80">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>) : (<Card className="relative w-full shadow-2xl overflow-hidden rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl"
                style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)'}}>
            <CardHeader className="px-5 sm:px-8 pt-8 pb-4 border-b border-blue-900/20">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Verify your email</CardTitle>
              <p className="text-center text-gray-300 mt-2 text-sm">
                We've sent a verification code to {emailAddress}
              </p>
            </CardHeader>
            <CardContent className="px-5 sm:px-6">
              <form onSubmit={handleEmailVerify}>                
                <div className="flex flex-col gap-5 sm:gap-6">              
                  <div className="grid gap-2 sm:gap-3">
                    <Label htmlFor="code" className="text-sm sm:text-base font-medium text-blue-100">Verification Code</Label>
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
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={0} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={1} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator className="mx-1 sm:mx-2 text-blue-300" />
                          <InputOTPGroup>
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={3} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={4} />
                            <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-[57px] text-base sm:text-lg border-blue-900/30 focus:border-blue-500 focus:ring-blue-500/50 bg-[#131631] text-white" index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200/60 mt-2 text-center break-words whitespace-normal">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>
                </div>                
                <div className="mt-8 flex flex-col gap-4 !max-h-screen">              
                  <Button
                    type="submit"
                    className="w-full hover:cursor-pointer h-12 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.99] rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                        Please wait
                      </>
                    ) : "Verify Email"}
                  </Button>              
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 mt-2 sm:mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full sm:w-auto text-sm sm:text-base text-blue-300 hover:text-blue-100 hover:bg-blue-900/30 hover:cursor-pointer transition-all rounded-lg"
                      onClick={() => setPendingVerification(false)}
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Sign Up
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full pr-2 sm:w-auto text-sm sm:text-base text-blue-400 hover:text-blue-300 hover:cursor-pointer hover:underline transition-colors"
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