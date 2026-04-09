import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/lib/api';
import { homePathForUser, useAuth } from '@/lib/auth';

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@instanthomes.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await login(email, password);
      const destination = typeof location.state?.from === 'string' ? location.state.from : homePathForUser(user);
      navigate(destination, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to sign in right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Platform access</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">Sign in to Instant Homes</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Admins manage tenants and tenant teams manage funnels, branding, and template-linked public experiences.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-white/85">
            Email
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-white/85">
            Password
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200"
          >
            {isSubmitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-white/65">
          <p>One sign-in works for both admin and tenant accounts.</p>
          <Link className="text-emerald-300 underline-offset-4 hover:underline" to="/bennett-local-group/laurel-ridge-drive-001">
            View public funnel
          </Link>
        </div>
      </div>
    </div>
  );
}
