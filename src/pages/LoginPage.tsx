import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, Mail, Lock, Loader2, ArrowRight, AlertCircle, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else if (mode === 'signup') {
      setError(null);
      setLoading(false);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 rounded-xl bg-[#17365D] flex items-center justify-center mb-4 shadow-md">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#263445] tracking-wide">NAGAR VISION AI</h1>
          <p className="text-xs text-gray-500 mt-1 tracking-widest">GANDHIDHAM MUNICIPAL CORPORATION</p>
        </div>

        <div className="bg-white border border-ink-700 rounded-lg shadow-sm p-8">
          <div className="flex gap-2 mb-6 p-1 bg-ink-800/50 rounded-lg border border-ink-700">
            <button
              onClick={() => { setMode('signin'); setError(null); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                mode === 'signin' ? 'bg-[#17365D]/10 text-[#17365D] border border-[#17365D]/20' : 'text-gray-500 hover:text-[#263445]',
              )}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                mode === 'signup' ? 'bg-[#168C8C]/10 text-[#168C8C] border border-[#168C8C]/20' : 'text-gray-500 hover:text-[#263445]',
              )}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#168C8C]/5 border border-[#168C8C]/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-[#168C8C] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600">
                After creating your account, sign in with the same credentials to access the dashboard.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gandhidham.gov.in"
                  autoComplete="email"
                  className="w-full bg-white border border-ink-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-white border border-ink-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#C83E3E]/5 border border-[#C83E3E]/20">
                <AlertCircle className="w-4 h-4 text-[#C83E3E] shrink-0 mt-0.5" />
                <p className="text-xs text-[#C83E3E]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#17365D] text-white text-sm font-medium hover:bg-[#2563A6] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Gandhidham Municipal Corporation
            <br />
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
