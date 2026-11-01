import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield, Users, Trash2, Mail, Lock, Loader2, ArrowRight,
  AlertCircle, UserPlus, LogIn, CheckCircle2, Building2, User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const portalConfig: Record<UserRole, { title: string; icon: typeof Shield; color: string; hint: string }> = {
  admin: { title: 'Admin Portal', icon: Shield, color: '#17365D', hint: 'admin@gandhidham.gov.in' },
  citizen: { title: 'Citizen Portal', icon: Users, color: '#168C8C', hint: 'your.email@gmail.com' },
  crew: { title: 'Cleaning Crew Portal', icon: Trash2, color: '#218838', hint: 'crew@gandhidham.gov.in' },
};

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = (searchParams.get('portal') as UserRole) || 'citizen';
  const config = portalConfig[portal] || portalConfig.citizen;

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      }
    } else {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 rounded-xl bg-[#17365D] flex items-center justify-center mb-4 shadow-md">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#263445] tracking-wide">SWATCHNETRA</h1>
          <p className="text-xs text-gray-500 mt-1 tracking-widest text-center">
            GANDHIDHAM MUNICIPAL CORPORATION
          </p>
        </div>

        <div className="bg-white border border-ink-700 rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ink-700">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15`, border: `1px solid ${config.color}30` }}>
              <config.icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#263445]">{config.title}</h2>
              <p className="text-xs text-gray-500">{mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}</p>
            </div>
          </div>

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
                New accounts are created as citizens. An admin can upgrade your role to crew or admin after verification.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white border border-ink-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#263445] placeholder-gray-400 focus:outline-none focus:border-[#168C8C] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={config.hint}
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

          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-xs text-gray-500 hover:text-[#263445] mt-4 transition-colors"
          >
            Back to portal selection
          </button>
        </div>
      </div>
    </div>
  );
}
