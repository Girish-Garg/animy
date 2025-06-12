import React, { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"
import googleSvg from "@/assets/google-logo.svg";

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { signOut } = useClerk();

  useEffect(() => {
    signOut(); // 🚨 Only use this in dev/testing to force logout
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if(isSignedIn) {
        navigate('/dashboard');
        return;
      }
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      })
      if(completeSignIn.status !== 'complete') {
        setError('Sign in failed, please try again.');
      }
      if(completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        navigate('/dashboard');
      }
    } catch (err) {
      console.log("Sign in error:", err);
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred during sign in.');
      return;
    } finally {
      setIsLoading(false);
    }
  }  
  const handleGoogleLogin = async () => {
    if (!isLoaded) {
      setError('Loading, please try again later.');
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err) {
      setError(err.errors ? err.errors[0].longMessage : 'An error occurred with Google sign in.');
      return;
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8 sm:px-6 md:py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="px-5 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent className="px-5 sm:px-6">
          <form onSubmit={handleSignInSubmit}>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
                  <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
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
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <Button
                type="submit"
                className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Please wait
                  </>
                ) : "Sign In"}
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
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
          >
            <img src={googleSvg} alt="Google" className='size-4 sm:size-5'/>
            Sign in with Google
          </Button>
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}