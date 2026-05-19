import { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';
import './login-form.css';

const emailSchema = z.string().email('Enter a valid email address.');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters.');

export function LoginForm() {
  const [isDark, setIsDark] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  useEffect(() => {
    const stored = localStorage.getItem('drs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('drs-theme', next ? 'dark' : 'light');
  }

  function showToast(message: string) {
    setToast({ message, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  }

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value.email, password: value.password }),
        });
        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          showToast('Invalid email or password');
          setIsLoading(false);
        }
      } catch {
        showToast('Network error — please try again');
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="drs-body">
      <div className="bg" aria-hidden="true" />
      <div className="bg-scrim" aria-hidden="true" />

      <main className="shell">
        {/* ===== LEFT: hero ===== */}
        <aside className="hero">
          <div className="hero-top">
            <div className="hero-logo">
              <img src="/assets/adani-logo.png" alt="Adani Renewables" />
            </div>
            <span className="hero-wordmark">Project Lifecycle Platform</span>
          </div>

          <div className="hero-mid">
            <span className="eyebrow">
              <span className="dot" />
              Building a Carbon-free Future
            </span>
            <h1>
              Powering India's transition to{' '}
              <span className="accent">clean energy.</span>
            </h1>
            <p>
              Sign in to the Drawing Repository System — the central platform for RFC,
              As-Built and FCN workflows across every Adani Renewables site.
            </p>
          </div>

          <div className="hero-bottom">
            <div className="stat">
              <div className="v">50<small> GW</small></div>
              <div className="l">2030 Target Capacity</div>
            </div>
            <div className="stat">
              <div className="v">25K<small>+</small></div>
              <div className="l">Drawings Managed</div>
            </div>
            <div className="stat">
              <div className="v">16<small>+</small></div>
              <div className="l">Active Sites</div>
            </div>
          </div>
        </aside>

        {/* ===== RIGHT: panel ===== */}
        <section className="panel">
          <div className="panel-top">
            <div className="panel-logo">
              <img src="/assets/adani-logo.png" alt="Adani Renewables" />
            </div>
            <div className="right-meta">
              <span className="hide-sm">Need access?</span>
              <a href="#contact">Contact admin</a>
              <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle dark mode">
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          <div className="card-wrap">
            <div className="card">
              <span className="role-chip">
                <ShieldCheck size={12} /> Secure Sign-in
              </span>
              <h2>Welcome back</h2>
              <p className="sub">Sign in with your Adani SSO account or use your registered Email ID.</p>

              <button
                className="sso"
                type="button"
                onClick={() => showToast('Redirecting to Microsoft SSO…')}
              >
                <img src="/assets/microsoft-logo.png" alt="" />
                <span>Continue with Microsoft</span>
              </button>

              <div className="or-row">or sign in with email</div>

              <form
                className="login-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                {/* Email */}
                <form.Field
                  name="email"
                  validators={{ onBlur: ({ value }) => {
                    const r = emailSchema.safeParse(value);
                    return r.success ? undefined : r.error.issues[0]?.message;
                  }}}
                >
                  {(field) => (
                    <div className={`field${field.state.meta.errors.length ? ' error' : ''}`}>
                      <div className="field-head">
                        <label htmlFor="email">Email ID</label>
                      </div>
                      <div className={`input-wrap${field.state.meta.errors.length ? ' has-error' : ''}`}>
                        <span className="leading"><Mail size={16} /></span>
                        <input
                          id="email"
                          type="email"
                          autoComplete="username"
                          placeholder="firstname.lastname@adani.com"
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                      <span className="err-msg">
                        <AlertCircle size={12} /> {field.state.meta.errors[0]}
                      </span>
                    </div>
                  )}
                </form.Field>

                {/* Password */}
                <form.Field
                  name="password"
                  validators={{ onBlur: ({ value }) => {
                    const r = passwordSchema.safeParse(value);
                    return r.success ? undefined : r.error.issues[0]?.message;
                  }}}
                >
                  {(field) => (
                    <div className={`field${field.state.meta.errors.length ? ' error' : ''}`}>
                      <div className="field-head">
                        <label htmlFor="password">Password</label>
                        <a className="hint" href="#forgot">Forgot Password ?</a>
                      </div>
                      <div className={`input-wrap${field.state.meta.errors.length ? ' has-error' : ''}`}>
                        <span className="leading"><Lock size={16} /></span>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                        <button
                          type="button"
                          className="trailing"
                          onClick={() => setShowPassword(v => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="err-msg">
                        <AlertCircle size={12} /> {field.state.meta.errors[0]}
                      </span>
                    </div>
                  )}
                </form.Field>

                <div className="check-row">
                  <label className="check" onClick={() => setRemember(v => !v)}>
                    <span className={`check-box${remember ? ' checked' : ''}`}>
                      {remember && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button className="submit" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="spinner" aria-hidden="true" />
                  ) : null}
                  <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="card-footer">
                <span>Protected by Adani SSO · Single Sign-On</span>
                <span className="links">
                  <a href="#help">Help</a>
                  <a href="#privacy">Privacy</a>
                  <a href="#terms">Terms</a>
                </span>
              </div>
            </div>
          </div>

          <div className="panel-foot">
            <span><span className="wm">© 2025 Adani Renewables.</span> All rights reserved.</span>
            <span>v2.4 · Pilot MVP</span>
          </div>
        </section>
      </main>

      {/* Toast */}
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <CheckCircle2 size={18} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
