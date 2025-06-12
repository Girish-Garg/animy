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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { AlertCircleIcon, ArrowLeft, Loader2Icon } from "lucide-react"
import googleSvg from "@/assets/google-logo.svg";

export default function SignUp() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    if (!isLoaded) {
      setError('Loading, please try again later.');
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
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred with Google sign up.');
    }
  }

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError('Verification failed, please try again.');
        return;
      }

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        console.log(JSON.stringify(completeSignUp, null, 2));
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred during email verification.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError('');
      alert('Verification code resent to your email');
    } catch (err) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors ? err.errors[0].longMessage : 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  }
  return (<div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8 sm:px-6 md:py-12">
    {!pendingVerification ? (
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="px-5 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Create your account</CardTitle>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form onSubmit={handleSignUpSubmit}>
            <div className="flex flex-col gap-7">
              {error && (
                <Alert variant="destructive" className="py-2 sm:py-3 flex items-baseline">
                    <AlertCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 align-middle"/>
                    <AlertDescription className="text-sm sm:text-base ml-2">
                      {error}
                    </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
                  required
                />
              </div>                
              <div className="grid gap-2 sm:gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4"
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
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base"
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
        <CardFooter className="flex-col gap-3 sm:gap-4 px-5 sm:px-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base flex items-center justify-center gap-2"
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
              <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>) : (
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="px-5 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-2">
            We've sent a verification code to {emailAddress}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form onSubmit={handleEmailVerify}>
            <div className="flex flex-col gap-7">
              {error && (
                <Alert variant="destructive" className="py-2 sm:py-3 flex items-baseline">
                    <AlertCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 align-middle"/>
                    <AlertDescription className="text-sm sm:text-base ml-2">
                      {error}
                    </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-2 sm:gap-3">
                <Label htmlFor="code" className="text-sm sm:text-base font-medium">Verification Code</Label>
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
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={0} />
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={1} />
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-1 sm:mx-2" />
                      <InputOTPGroup>
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={3} />
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={4} />
                        <InputOTPSlot className="h-12 w-12 sm:h-14 sm:w-16 text-base sm:text-lg" index={5} />
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
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base"
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
                  className="w-full sm:w-auto text-sm sm:text-base text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                  onClick={() => setPendingVerification(false)}
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  Back to Sign Up
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full sm:w-auto text-sm sm:text-base hover:cursor-pointer"
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
  );
}