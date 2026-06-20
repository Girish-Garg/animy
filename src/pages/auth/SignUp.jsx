import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { ArrowLeft, Loader2Icon, MailIcon, LockIcon } from "lucide-react";
import googleSvg from "@/assets/google-logo.svg";
import AuthLayout from "@/components/auth/AuthLayout";
import IconInput from "@/components/auth/IconInput";
import { clerkErrorMessage } from "@/lib/clerkError";

const CARD_CLASS =
  "relative w-full shadow-2xl rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl";
const CARD_STYLE = { background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)' };

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
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'An error occurred during sign up.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'An error occurred with Google sign up.'));
    }
  };

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/dashboard');
      } else {
        toast.error('Verification failed, please try again.');
      }
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'An error occurred during email verification.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    setIsLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('Verification code resent to your email');
    } catch (err) {
      toast.error(clerkErrorMessage(err, 'Failed to resend verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="md">
      {!pendingVerification ? (
        <Card className={`!gap-0 ${CARD_CLASS}`} style={CARD_STYLE}>
          <CardHeader className="px-5 sm:px-8 pt-6 pb-5 border-b border-blue-900/20">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-white">Create your account</CardTitle>
            <p className="text-center text-gray-300 mt-1 text-sm">Register to get started with AnimY</p>
          </CardHeader>
          <CardContent className="px-5 sm:px-6 py-4">
            <form onSubmit={handleSignUpSubmit}>
              <div className="flex flex-col gap-4 sm:gap-5">
                <IconInput
                  id="email"
                  label="Email"
                  icon={<MailIcon size={18} />}
                  type="email"
                  placeholder="your@email.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                />
                <div>
                  <IconInput
                    id="password"
                    label="Password"
                    icon={<LockIcon size={18} />}
                    type="password"
                    placeholder="•••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-blue-200/60 mt-1">Must be at least 8 characters</p>
                </div>
              </div>
              <div id="clerk-captcha" />
              <div className="mt-5">
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer h-10 text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.99] rounded-xl"
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
          <CardFooter className="flex-col gap-3 px-5 sm:px-8 pb-6 pt-3">
            <div className="relative w-full my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-900/30"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 py-0.5 text-blue-300 font-medium tracking-wider rounded-full bg-[#131631]">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full hover:cursor-pointer h-10 text-sm flex items-center justify-center gap-3 bg-[#131631] border-blue-900/30 hover:bg-[#1a1f37]/40 transition-all text-white hover:text-white rounded-xl transform hover:scale-[1.02] active:scale-[0.99]"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              type="button"
            >
              <img src={googleSvg} alt="Google" className="size-5" />
              Sign up with Google
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-blue-200/80">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card className={CARD_CLASS} style={CARD_STYLE}>
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
    </AuthLayout>
  );
}
