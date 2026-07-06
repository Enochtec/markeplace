import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Store, UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  shopName?: string;
}

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'SHOP_OWNER'>('CUSTOMER');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      await registerUser({
        email: data.email, password: data.password,
        firstName: data.firstName, lastName: data.lastName, phone: data.phone,
        role,
        shopName: role === 'SHOP_OWNER' ? data.shopName : undefined,
      });
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === 'SHOP_OWNER') {
        navigate('/shop/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-2xl mb-5 shadow-lg shadow-orange-200">
            <svg className="w-7 h-7 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
              <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
              <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Join thousands of happy shoppers</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-7">
          {/* Role selector */}
          <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
            <button type="button" onClick={() => setRole('CUSTOMER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'CUSTOMER' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <UserIcon size={15} /> Customer
            </button>
            <button type="button" onClick={() => setRole('SHOP_OWNER')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${role === 'SHOP_OWNER' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Store size={15} /> Shop Owner
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  {...register('firstName', { required: 'Required' })}
                  className="input-field"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  {...register('lastName', { required: 'Required' })}
                  className="input-field"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className="input-field"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                {...register('phone')}
                className="input-field"
                placeholder="+1 234 567 890"
              />
            </div>

            {role === 'SHOP_OWNER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
                <input
                  {...register('shopName', { required: role === 'SHOP_OWNER' ? 'Shop name is required' : false })}
                  className="input-field"
                  placeholder="Your shop name"
                />
                {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Your shop will be pending admin approval.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  className="input-field pr-11"
                  placeholder="Create a password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                className="input-field"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full !py-3 text-sm mt-1"
            >
              {isLoading ? 'Creating account...' : role === 'SHOP_OWNER' ? 'Register Shop' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-400">
            By signing up, you agree to our{' '}
            <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">Terms</a> and{' '}
            <a href="#" className="text-orange-500 hover:text-orange-600 transition-colors">Privacy Policy</a>
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
