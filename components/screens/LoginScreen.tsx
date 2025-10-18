import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import ShieldIcon from '../icons/ShieldIcon';
import UserIcon from '../icons/UserIcon';
import LockIcon from '../icons/LockIcon';
import { useAuth, useTranslation } from '../../App';
import { UserRole } from '../../types';
import { generateOTP } from '../../services/aiService';
import ThemeToggleButton from '../common/ThemeToggleButton';
import { validateEmail, validateOtp } from '../../utils/validation';
import RoleSelector from '../common/RoleSelector';

const LoginScreen: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.Farmer);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const loginableRoles = Object.values(UserRole).filter(r => r !== UserRole.AI);

  const validateField = (name: string, value: string): string => {
      let error = '';
      if (name === 'userId' && value.includes('@')) {
          error = validateEmail(value);
      }
      if (name === 'otp') {
          error = validateOtp(value);
      }
      return error ? t(error) : '';
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setter(value);
      // Real-time validation for email format and OTP format
      const validationError = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: validationError, form: '' }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
        setErrors(prev => ({...prev, password: ''}));
    }
  }


  const handleGetOtp = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!userId) newErrors.userId = t('errorRequired', { fieldName: t('userIdOrEmail') });
    if (!password) newErrors.password = t('errorRequired', { fieldName: t('password') });
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors, form: '' }));
        return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await generateOTP();
      setIsOtpSent(true);
    } catch (err) {
      setErrors(prev => ({...prev, form: t('errorFailedOtp')}));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      setErrors(prev => ({...prev, form: t('errorOtpRequired')}));
      return;
    }
    const otpError = validateField('otp', otp);
    if (otpError || !otp) {
      setErrors(prev => ({...prev, otp: otpError || t('errorRequired', { fieldName: t('otp') }) }));
      return;
    }
    setErrors({});
    setIsLoading(true);
    // Mock login validation
    setTimeout(() => {
      login({ id: userId, role, password: 'mock_password_123' });
      setIsLoading(false);
      navigate('/select-role');
    }, 1000);
  };
  
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center p-4 relative">
       <div className="absolute top-0 right-0 p-2">
        <ThemeToggleButton className="focus:ring-green-500/50 dark:focus:ring-white/50 focus:ring-offset-transparent" />
      </div>
      <div className="bg-green-600 rounded-full p-4 mb-4">
        <ShieldIcon className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white">{t('saferoot')}</h1>
      <p className="text-lg text-gray-800 dark:text-green-200 mt-2 mb-8">{t('secureHerbalSupplyChain')}</p>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-green-200 mb-2">{t('selectRole')}</label>
            <RoleSelector
              roles={loginableRoles}
              selectedRole={role}
              onSelectRole={setRole}
              disabled={isLoading}
            />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-green-200">{t('userIdOrEmail')}</label>
          <Input icon={<UserIcon className="w-5 h-5" />} type="text" placeholder={t('enterIdOrEmail')} value={userId} onChange={handleInputChange(setUserId, 'userId')} isInvalid={!!errors.userId} disabled={isLoading} />
          {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-green-200">{t('password')}</label>
          <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterPassword')} value={password} onChange={handlePasswordChange} isInvalid={!!errors.password} disabled={isLoading} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {errors.form && <p className="text-red-500 dark:text-red-400 text-sm text-center">{errors.form}</p>}

        {isOtpSent && (
          <div className="animate-fade-in">
            <label className="text-sm font-medium text-gray-900 dark:text-green-200">{t('otp')}</label>
            <Input type="text" placeholder={t('enterOtp')} value={otp} onChange={handleInputChange(setOtp, 'otp')} isInvalid={!!errors.otp} disabled={isLoading} />
            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
          </div>
        )}

        <div className="pt-4">
          {isOtpSent ? (
            <Button variant="primary" type="submit" disabled={isLoading || !!errors.otp}>
              {isLoading ? <Spinner /> : t('login')}
            </Button>
          ) : (
            <Button variant="primary" type="button" onClick={handleGetOtp} disabled={isLoading}>
              {isLoading ? <Spinner /> : t('getOtp')}
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center flex justify-between w-full">
        <span className="text-gray-800 dark:text-green-200">{t('newUser')} 
            <Link to="/register" className="font-bold text-gray-900 dark:text-white hover:underline ml-1">
                {t('registerHere')}
            </Link>
        </span>
        <Link to="/forgot-password" className="text-sm font-semibold text-gray-800 dark:text-green-200 hover:underline">
            {t('forgotPassword')}
        </Link>
      </div>
    </div>
  );
};

export default LoginScreen;
