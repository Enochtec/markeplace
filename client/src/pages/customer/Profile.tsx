import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'info' | 'password'>('info');
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const { register: regProfile, handleSubmit: submitProfile, formState: { errors: errsProfile } } = useForm<ProfileForm>({
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName, phone: user?.phone || '' },
  });

  const { register: regPwd, handleSubmit: submitPwd, formState: { errors: errsPwd }, watch: watchPwd, reset: resetPwd } = useForm<PasswordForm>();

  const onProfileSubmit = async (data: ProfileForm) => {
    setSavingInfo(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
      await authApi.updateProfile(formData);
      await refreshUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingInfo(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setSavingPwd(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPwd();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Avatar section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-5">
        <div className="relative">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
            <Camera size={13} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append('avatar', file);
              try {
                await authApi.updateProfile(formData);
                await refreshUser();
                toast.success('Avatar updated!');
              } catch {
                toast.error('Failed to update avatar');
              }
            }} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full capitalize">
            {user?.role?.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {[{ id: 'info', icon: User, label: 'Personal Info' }, { id: 'password', icon: Lock, label: 'Change Password' }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id as 'info' | 'password')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${tab === id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-5">Personal Information</h3>
          <form onSubmit={submitProfile(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input {...regProfile('firstName', { required: 'Required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                {errsProfile.firstName && <p className="text-red-500 text-xs mt-1">{errsProfile.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input {...regProfile('lastName', { required: 'Required' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                {errsProfile.lastName && <p className="text-red-500 text-xs mt-1">{errsProfile.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (read-only)</label>
              <input value={user?.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input {...regProfile('phone')} type="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <button type="submit" disabled={savingInfo}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors">
              {savingInfo ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-5">Change Password</h3>
          <form onSubmit={submitPwd(onPasswordSubmit)} className="space-y-4">
            {[
              { name: 'currentPassword' as const, label: 'Current Password' },
              { name: 'newPassword' as const, label: 'New Password', min: 6 },
              { name: 'confirmPassword' as const, label: 'Confirm New Password' },
            ].map(({ name, label, min }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type="password" {...regPwd(name, {
                  required: 'Required',
                  ...(min ? { minLength: { value: min, message: `Min ${min} characters` } } : {}),
                  ...(name === 'confirmPassword' ? { validate: (v) => v === watchPwd('newPassword') || 'Passwords do not match' } : {}),
                })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                {errsPwd[name] && <p className="text-red-500 text-xs mt-1">{errsPwd[name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={savingPwd}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl text-sm transition-colors">
              {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
