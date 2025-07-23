import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2Icon, User, Mail, Shield, Bell, LogOut, Camera } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!isSignedIn && isLoaded) {
    navigate('/signin');
  }

  React.useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [isLoaded, user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    if (!isLoaded) return;
    console.log(user);
    console.log(formData);
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // For Clerk, we need to use the session's updatePassword method
      // First, we need to verify the current password
      await user.updatePassword({
        newPassword: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        signOutOfOtherSessions: true
      });
      
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Handle different Clerk error types
      if (error.message?.includes('additional verification')) {
        toast.error('Additional verification required. Please check your email or try again later.');
      } else if (error.errors?.[0]?.code === 'form_password_incorrect') {
        toast.error('Current password is incorrect');
      } else if (error.errors?.[0]?.code === 'form_password_pwned') {
        toast.error('This password has been compromised. Please choose a different password.');
      } else if (error.errors?.[0]?.code === 'form_password_too_common') {
        toast.error('This password is too common. Please choose a more secure password.');
      } else if (error.errors?.[0]?.code === 'form_password_not_strong_enough') {
        toast.error('Password is not strong enough. Please include uppercase, lowercase, numbers, and special characters.');
      } else {
        toast.error('Failed to update password. Please try again later.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

    const fileInputRef = useRef();
    const handleUpdateProfileImage = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!user) return;
      toast.promise(
        user.setProfileImage({ file }),
        {
          loading: 'Uploading image...',
          success: 'Profile image updated!',
          error: 'Failed to update profile image',
        }
      );
    };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-fit overflow-y-auto relative">

      <div className="relative z-20 container mx-auto px-4 py-8">
        <Toaster richColors position="top-center" expand={false} />
        <div 
          className="backdrop-blur-3xl rounded-xl shadow-xl border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 p-6 mb-6 hover:shadow-blue-900/10 group"
          style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.80) 100%)'}}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group/avatar">
              <Avatar className="h-20 w-20 border-4 border-blue-900/40 shadow-lg transition-all duration-300 group-hover/avatar:border-blue-700/50">
                <AvatarImage src={user.imageUrl} className="opacity-90 group-hover/avatar:opacity-100 transition-opacity" />
                <AvatarFallback className="bg-gradient-to-br from-blue-800 to-blue-900 text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleUpdateProfileImage}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 shadow-lg border border-blue-500 opacity-0 group-hover/avatar:opacity-100 transform translate-x-0 translate-y-0 group-hover/avatar:translate-y-1 transition-all duration-200 hover:bg-blue-500 hover:cursor-pointer"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <div className="text-center md:text-left md:flex-1 transition-all duration-300">
              <h2 className="text-xl font-medium text-white group-hover:text-blue-100">{user.fullName}</h2>
              <p className="text-sm text-blue-300/80 group-hover:text-blue-200/90 transition-colors">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div className="flex items-center">           
              <a
                href="/signin" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-red-900/10 hover:cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </a>
            </div>
          </div>
        </div>
        <div 
          className="backdrop-blur-3xl rounded-xl shadow-xl border border-blue-900/20 hover:border-blue-700/30 transition-all duration-500 p-6 hover:shadow-blue-900/10"
          style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.80) 100%)'}}
        >
          <Tabs defaultValue="personal" className="w-full" onValueChange={(value) => setActiveTab(value)}>            
            <TabsList className="h-12 grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#131631]/80 p-1 rounded-xl border border-blue-900/20 mb-6">              
              <TabsTrigger 
                value="personal" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/20 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/30 transition-all duration-300 py-2 transform hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              >
                <User size={18} className="text-blue-400 data-[state=active]:text-white" />
                <span className="hidden sm:inline">Personal Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/20 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/30 transition-all duration-300 py-2 transform hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              >
                <Mail size={18} className="text-blue-400 data-[state=active]:text-white" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>              
              <TabsTrigger 
                value="security" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/20 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/30 transition-all duration-300 py-2 transform hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              >
                <Shield size={18} className="text-blue-400 data-[state=active]:text-white" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>              
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/20 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/30 transition-all duration-300 py-2 transform hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              >
                <Bell size={18} className="text-blue-400 data-[state=active]:text-white" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="mt-0">
              <div>
                <h3 className="text-xl font-medium text-white mb-6 border-b border-blue-900/30 pb-2 inline-block">Personal Information</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm sm:text-base font-medium text-blue-100">First name</Label>                      
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-12 text-sm sm:text-base bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all rounded-xl hover:border-blue-700/40 shadow-inner shadow-blue-900/10"
                        placeholder="First name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm sm:text-base font-medium text-blue-100">Last name</Label>                      
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-12 text-sm sm:text-base bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all rounded-xl hover:border-blue-700/40 shadow-inner shadow-blue-900/10"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  
                  <div>                    
                    <Button 
                      type="submit"
                      disabled={isUpdating}
                      className="w-full hover:cursor-pointer h-12 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-blue-500/30 hover:border-blue-400/40"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="mt-0">
              <div>
                <h3 className="text-xl font-medium text-white mb-6 border-b border-blue-900/30 pb-2 inline-block">Email Addresses</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#131631]/50 rounded-lg border border-blue-900/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{user.primaryEmailAddress?.emailAddress}</p>
                        <p className="text-xs text-blue-300 mt-1">Primary email</p>
                      </div>
                      <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <div>
                <h3 className="text-xl font-medium text-white mb-6 border-b border-blue-900/30 pb-2 inline-block">Security</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-[#131631]/50 rounded-lg border border-blue-900/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">Password</p>
                        <p className="text-xs text-gray-300 mt-1">Change your account password</p>
                      </div>
                      <Button 
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl h-10 px-4 border border-blue-500/30 hover:border-blue-400/40 hover:cursor-pointer"
                      >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                      </Button>
                    </div>
                    
                    {showPasswordForm && (
                      <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4 pt-4 border-t border-blue-900/30">
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                          <p className="text-xs text-blue-200">
                            <strong>Note:</strong> Changing your password may require additional verification for security. 
                            You might need to verify your email or re-authenticate.
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-medium text-blue-100">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="h-12 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all rounded-xl hover:border-blue-700/40 shadow-inner shadow-blue-900/10"
                            placeholder="Enter current password"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-medium text-blue-100">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="h-12 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all rounded-xl hover:border-blue-700/40 shadow-inner shadow-blue-900/10"
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-blue-100">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="h-12 bg-[#131631] border-blue-900/30 text-white placeholder:text-blue-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all rounded-xl hover:border-blue-700/40 shadow-inner shadow-blue-900/10"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <Button 
                            type="submit"
                            disabled={isChangingPassword}
                            className="flex-1 hover:cursor-pointer h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl border border-blue-500/30 hover:border-blue-400/40"
                          >
                            {isChangingPassword ? (
                              <>
                                <Loader2Icon className="h-5 w-5 animate-spin mr-2" />
                                Updating...
                              </>
                            ) : "Update Password"}
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                            }}
                            className="px-6 h-12 bg-[#131631] hover:bg-[#1a1f37] text-blue-300 hover:text-blue-200 border border-blue-900/30 hover:border-blue-700/40 transform hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-900/20 hover:cursor-pointer"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <div>
                <h3 className="text-xl font-medium text-white mb-6 border-b border-blue-900/30 pb-2 inline-block">Notifications</h3>
                <p className="text-gray-300 mb-6">Manage how you receive notifications</p>
                
                <div className="space-y-4">                  
                  <div className="flex items-center justify-between p-4 bg-[#131631]/50 rounded-lg border border-blue-900/30 hover:border-blue-700/40 transition-all duration-300 hover:shadow-md hover:shadow-blue-900/10 group">                    
                  <div className="hover:cursor-pointer">
                      <p className="text-white group-hover:text-blue-100 transition-colors">Email Notifications</p>
                      <p className="text-xs text-gray-300 group-hover:text-gray-200 mt-1 transition-colors">Receive notifications via email</p>
                    </div><label className="relative inline-flex items-center cursor-pointer group">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-blue-900/30 hover:bg-blue-900/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-blue-900/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-blue-600 peer-checked:hover:bg-blue-500 peer-checked:shadow-inner peer-checked:shadow-blue-700/20 transition-all duration-300"></div>
                    </label>
                  </div>
                    <div className="flex items-center justify-between p-4 bg-[#131631]/50 rounded-lg border border-blue-900/30 hover:border-blue-700/40 transition-all duration-300 hover:shadow-md hover:shadow-blue-900/10 group">                    
                    <div className="hover:cursor-pointer">
                      <p className="text-white group-hover:text-blue-100 transition-colors">New Features</p>
                      <p className="text-xs text-gray-300 group-hover:text-gray-200 mt-1 transition-colors">Get notified about new features</p>
                    </div><label className="relative inline-flex items-center cursor-pointer group">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-blue-900/30 hover:bg-blue-900/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-blue-900/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md peer-checked:bg-blue-600 peer-checked:hover:bg-blue-500 peer-checked:shadow-inner peer-checked:shadow-blue-700/20 transition-all duration-300"></div>
                    </label>
                  </div>
                </div>              
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
