import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      switch (storedUser.role) {
        case 'ADMIN': navigate('/admin/dashboard', { replace: true }); break;
        case 'SHOP_OWNER': navigate('/shop/dashboard', { replace: true }); break;
        default: navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none">
            <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
            <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
            <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
          </svg>
        </div>
        <span className="text-xl font-extrabold text-gray-900 tracking-tight">
          Market<span className="text-orange-500">hub</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-gray-300 rounded p-7"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>

        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Sign In</h1>
        <p className="text-sm text-gray-500 mb-6">
          New customer?{' '}
          <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600">Start here</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" {...register('email', { required: 'Email is required' })}
              className="input-field" placeholder="you@example.com" autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-orange-500 hover:text-orange-600 transition-colors">Forgot password?</a>
            </div>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="input-field pr-10" placeholder="Your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full !py-2.5 mt-1">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        By signing in, you agree to our{' '}
        <a href="#" className="underline hover:text-gray-600">Terms</a> and{' '}
        <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </div>
  );
}
