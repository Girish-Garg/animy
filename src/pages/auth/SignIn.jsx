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
import { Loader2Icon, LockIcon, MailIcon, LogInIcon } from "lucide-react"
import googleSvg from "@/assets/google-logo.svg";

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
      toast.error(err.errors ? err.errors[0].longMessage : 'An error occurred with Google sign in.');      return;
    }
  }
  
  return (    
    <div className="overflow-hidden flex relative items-center justify-center h-screen px-4 py-4 sm:px-6">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
        
      <div className="absolute inset-0 bg-black/60 z-10" />
      
      <Toaster richColors position="top-center" expand={false} />    
      <div className="relative z-20 w-full max-w-md">
        <Card className="relative w-full !gap-0 shadow-2xl overflow-hidden rounded-xl border border-blue-900/20 hover:border-blue-700/30 transition-all backdrop-blur-3xl"
              style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)'}}>          
          <CardHeader className="px-5 sm:px-8 pt-6 pb-3 border-b border-blue-900/20">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-white">Welcome back</CardTitle>
            <p className="text-center text-gray-300 mt-1 text-sm">Sign in to continue to your dashboard</p>
          </CardHeader>
          
          <CardContent className="px-5 sm:px-8 py-4">
            <form onSubmit={handleSignInSubmit}>
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium text-blue-100">Email</Label>                
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                      <MailIcon size={18} />
                    </div>                    
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="h-10 text-sm pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>       
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-blue-100">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-blue-300 hover:text-blue-100 hover:underline transition-colors">
                      Forgot password?
                    </Link>
                  </div>             
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                      <LockIcon size={18} />
                    </div>                    
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-sm pl-10 pr-4 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>
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
                  ) : "Sign In"}
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
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
            >
              <img src={googleSvg} alt="Google" className='size-5'/>
              Sign in with Google
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-blue-200/80">
                Don't have an account?{" "}              
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
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