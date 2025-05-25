import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { loginUser, registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';



const registerSchema = yup.object({
  fullName: yup.string().required('Ad Soyad gerekli'),
  email: yup.string().email('Geçerli bir email girin').required('Email gerekli'),
  phoneNumber: yup.string()
    .required('Telefon numarası gerekli')
    .matches(/^(\+90|0)?5\d{9}$/, 'Geçerli bir Türkçe telefon numarası girin'),
  password: yup
    .string()
    .required('Şifre gerekli')
    .min(8, 'En az 8 karakter')
    .matches(/[A-Z]/, 'En az 1 büyük harf')
    .matches(/[0-9]/, 'En az 1 rakam')
    .matches(/[!@#$%^&*]/, 'En az 1 özel karakter')
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

const getErrorMessage = (error: any) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.response?.data?.title ||
    error.response?.data?.errors?.[0] ||
    'Sunucu hatası'
  );
};

export default function Auth() {
  const [flipped, setFlipped] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterFormData>({ resolver: yupResolver(registerSchema) });

  useEffect(() => {
    if (!flipped) reset();
  }, [flipped, reset]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({
        email: loginForm.email,
        password: loginForm.password
      });
      const token = response.data.token;
      toast.success('Giriş başarılı!');
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
    
  };
  
  const navigate = useNavigate();
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      setFlipped(false);
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const onInvalid = (errors: FieldErrors<RegisterFormData>) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error('Formda hata var');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm sm:w-[400px] aspect-[4/5] perspective">
        <div className={`relative w-full h-full duration-700 transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
          {/* Login Face */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Giriş Yap</h2>
            <form className="space-y-2" onSubmit={handleLoginSubmit}>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 bg-blue-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  className="w-full px-3 py-2 bg-blue-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 cursor-pointer"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                  className="accent-blue-600 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                  Beni hatırla
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                Giriş Yap
              </button>
            </form>
            <p className="text-sm mt-4 text-center text-gray-600">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => setFlipped(true)}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Kayıt olun
              </button>
            </p>
          </div>

          {/* Register Face */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4 text-center">Kayıt Ol</h2>
            <form className="space-y-2" onSubmit={handleSubmit(handleRegisterSubmit, onInvalid)}>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  {...register('fullName')}
                  className="w-full px-3 py-2 bg-emerald-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-sm text-red-500 h-5">{errors.fullName?.message}</p>
              </div>

              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Email"
                  {...register('email')}
                  className="w-full px-3 py-2 bg-emerald-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-sm text-red-500 h-5">{errors.email?.message}</p>
              </div>

              <div className="space-y-1">
  <input
    type="tel"
    placeholder="Telefon Numarası"
    {...register('phoneNumber')}
    className="w-full px-3 py-2 bg-emerald-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
  />
  <p className="text-sm text-red-500 h-5">{errors.phoneNumber?.message}</p>
</div>

              <div className="relative space-y-1">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  {...register('password')}
                  className="w-full px-3 py-2 bg-emerald-50 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10"
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 cursor-pointer"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                >
                  {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                <p className="text-sm text-red-500 h-5">{errors.password?.message}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition cursor-pointer"
              >
                Kayıt Ol
              </button>
            </form>
            <p className="text-sm mt-4 text-center text-gray-600">
              Zaten bir hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="text-emerald-600 hover:underline cursor-pointer"
              >
                Giriş yap
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
