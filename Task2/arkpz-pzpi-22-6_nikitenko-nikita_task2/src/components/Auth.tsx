import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting authentication...');

    try {
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for the password reset link.",
        });
        setIsResetPassword(false);
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Email not confirmed')) {
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email for the confirmation link or try registering again.",
              variant: "destructive",
            });
          } else if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Invalid Credentials",
              description: "The email or password you entered is incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Error",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        if (data?.user) {
          toast({
            title: "Success",
            description: "Logged in successfully!",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          toast({
            title: "Registration Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: "Registration successful! Please check your email for verification.",
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && 
           (!isResetPassword && password.length >= 6 || isResetPassword);
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">
        {isResetPassword ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-2"
          />
        </div>
        {!isResetPassword && (
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mb-2"
            />
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !validateForm()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : isResetPassword ? (
            'Send Reset Link'
          ) : isLogin ? (
            'Login'
          ) : (
            'Register'
          )}
        </Button>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsLogin(!isLogin);
              setIsResetPassword(false);
            }}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </Button>
          {isLogin && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsResetPassword(!isResetPassword)}
            >
              {isResetPassword ? 'Back to Login' : 'Forgot Password?'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}