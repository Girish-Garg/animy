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
import { Toaster, toast } from 'sonner';
import { Loader2Icon } from "lucide-react"
import googleSvg from "@/assets/google-logo.svg";
import DotGrid from '@/block/Backgrounds/DotGrid/DotGrid';

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
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
      toast.error('Loading, please try again later.');
      return;
    }

    setIsLoading(true);

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
        toast.error('Sign in failed, please try again.');
      }
      if(completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        navigate('/dashboard');
      }
    } catch (err) {
      console.log("Sign in error:", err);
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred during sign in.');
      return;
    } finally {
      setIsLoading(false);
    }
  }  
  const handleGoogleLogin = async () => {
    if (!isLoaded) {
      toast.error('Loading, please try again later.');
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err) {
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred with Google sign in.');
      return;
    }
  }  
  
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
        <Card className="relative w-full shadow-xl z-10 bg-white/90 backdrop-blur-md border border-gray-200 overflow-hidden rounded-xl ring-1 ring-gray-50 transition-all hover:shadow-gray-200/50">        
          <CardHeader className="px-5 sm:px-6 pt-8 pb-4 bg-gradient-to-b from-white to-gray-50/30">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-900">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent className="px-5 sm:px-6">
            <form onSubmit={handleSignInSubmit}>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700">Password</Label>                  <Link to="/forgot-password" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors">
                      Forgot password?
                    </Link>
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
                </div>
              </div>
              <div className="mt-6 sm:mt-8">              
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer h-10 sm:h-12 text-sm sm:text-base bg-gray-800 hover:bg-black transition-all shadow-md hover:shadow-lg hover:shadow-gray-200/50 transform hover:-translate-y-0.5 active:translate-y-0"
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
                <Link to="/signup" className="text-gray-600 hover:text-gray-900 font-medium hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>     
        </Card>
      </div>
    </div>
  )
}