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
      <div className="w-full max-w-md bg-white border border-gray-300 rounded p-7"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>

        <h1 className="text-xl font-bold text-gray-900 mb-0.5">Create Account</h1>
        <p className="text-sm text-gray-500 mb-5">
          Already registered?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:text-orange-600">Sign in</Link>
        </p>

        {/* Role selector */}
        <div className="flex mb-5 border border-gray-300 rounded overflow-hidden">
          {([
            { id: 'CUSTOMER' as const, label: 'Customer', icon: UserIcon },
            { id: 'SHOP_OWNER' as const, label: 'Shop Owner', icon: Store },
          ]).map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setRole(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors ${
                role === id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
              <input {...register('firstName', { required: 'Required' })} className="input-field" placeholder="John" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
              <input {...register('lastName', { required: 'Required' })} className="input-field" placeholder="Doe" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              className="input-field" placeholder="you@example.com" autoComplete="email" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="tel" {...register('phone')} className="input-field" placeholder="+1 234 567 890" />
          </div>

          {role === 'SHOP_OWNER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name</label>
              <input {...register('shopName', { required: 'Shop name is required' })}
                className="input-field" placeholder="Your shop name" />
              {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Requires admin approval after registration.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'}
                {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="input-field pr-10" placeholder="Create a password" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password"
              {...register('confirmPassword', { required: 'Required', validate: v => v === watch('password') || 'Passwords do not match' })}
              className="input-field" placeholder="Repeat your password" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full !py-2.5 mt-1">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Creating account…
              </span>
            ) : role === 'SHOP_OWNER' ? 'Create Shop Account' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        By creating an account, you agree to our{' '}
        <a href="#" className="underline hover:text-gray-600">Terms</a> and{' '}
        <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </div>
  );
}
