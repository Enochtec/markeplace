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
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-2xl mb-5 shadow-lg shadow-orange-200">
            <svg className="w-7 h-7 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
              <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
              <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="input-field pr-11"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full !py-3 text-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
