import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Mail, Phone, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode');
  const redirectTo = searchParams.get('redirect') || '/';
  const oauthToken = searchParams.get('token');
  const oauthUser = searchParams.get('user');
  
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const { sendOtp, verifyOtp, completeOAuth, isAuthenticated, user, logout } = useAuth();

  // Handle OAuth callback
  useEffect(() => {
    if (oauthToken && oauthUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(oauthUser));
        completeOAuth(oauthToken, userData);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error('Failed to parse OAuth user data', err);
        setError('Google login failed. Please try again.');
      }
    }
    const oauthError = searchParams.get('error');
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, [oauthToken, oauthUser, completeOAuth, navigate, redirectTo]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (isAuthenticated && user) {
    return (
      <main className="container mx-auto px-4 py-32 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-border text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-primary">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome, {user.name || 'User'}!</h1>
          <p className="text-muted-foreground mb-2">{user.email || user.phone || 'Welcome back'}</p>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full mt-6 bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all active:scale-[0.98]"
          >
            Sign Out
          </button>
          <Link to="/" className="block mt-4 text-primary font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const handleSendOtp = async (e?: React.FormEvent, forceChannel?: 'email' | 'whatsapp' | 'sms') => {
    if (e) e.preventDefault();
    setError('');
    
    if (!identifier.trim() || !identifier.includes('@')) {
      return setError('Please enter a valid Email address');
    }

    setLoading(true);
    try {
      const channel = 'email';
      
      const response = await sendOtp(identifier, channel);
      setStep(2);
      setResendTimer(10);
      
      if (response && response.simulatedOtp) {
        toast.info(`Dev Mode: Your OTP is ${response.simulatedOtp}`, {
          duration: 10000,
          description: "Simulation mode active because email credentials are not set."
        });
      } else {
        toast.success(`OTP sent to ${identifier}!`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length < 6) {
      return setError('Please enter a valid 6-digit OTP');
    }

    setLoading(true);
    try {
      await verifyOtp(identifier, otp);
      toast.success('Successfully authenticated!');
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-32 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-border mt-8 sm:mt-0 relative overflow-hidden">
        {step === 2 && (
          <button onClick={() => setStep(1)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </button>
        )}

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {step === 1 ? <KeyRound size={28} className="text-primary" /> : <CheckCircle2 size={28} className="text-primary" />}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
            {step === 1 ? (isSignUp ? 'Create Account' : 'Welcome Back') : 'Verify OTP'}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            {step === 1 
              ? 'Enter your Email address to get a magic login code.' 
              : `We've sent a 6-digit code to ${identifier}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3.5 rounded-2xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-6" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. you@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-gray-800"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-2">
                  <Mail size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Get OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
            </button>

            <div className="my-8 flex items-center">
              <span className="h-px w-full bg-gray-100"></span>
              <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Or use</span>
              <span className="h-px w-full bg-gray-100"></span>
            </div>

            <a
              href="http://localhost:3000/api/oauth/google"
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </a>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-center pb-2">Enter 6-digit Code</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // numbers only
                className="w-full text-center tracking-[1em] text-4xl py-6 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold text-primary"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-primary text-white py-4 mt-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Log In Securely'}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 font-medium">
                Didn't receive the code?
              </p>
              <div className="mt-2">
                {resendTimer > 0 ? (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                ) : (
                  <div className="flex justify-center">
                    <button type="button" onClick={() => handleSendOtp(undefined, 'email')} className="text-primary hover:underline font-bold">Resend OTP</button>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 text-center text-sm font-medium text-gray-400">
            {isSignUp ? 'Already an MVP?' : "New to the squad?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-primary hover:underline font-bold"
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
