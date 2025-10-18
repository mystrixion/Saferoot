import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../App';
import { generateOTP } from '../../services/aiService';
import { validatePassword, validateOtp, PasswordValidationResult } from '../../utils/validation';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import UserIcon from '../icons/UserIcon';
import LockIcon from '../icons/LockIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

const ForgotPasswordScreen: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Enter ID, 2: Enter OTP/New Pass, 3: Success
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePassword(''));

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setPasswordValidation(validatePassword(newPassword));
  }, [newPassword]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!userId) {
        setErrors({ userId: t('errorRequired', { fieldName: t('userId') }) });
        return;
    }

    setLoading(true);

    // Simulate checking if user exists by looking in localStorage
    const storedUserRaw = localStorage.getItem('saferoot_user');
    if (storedUserRaw) {
      const storedUser = JSON.parse(storedUserRaw);
      if (storedUser.id === userId) {
        try {
          await generateOTP();
          setStep(2);
        } catch (err) {
          setErrors({ form: t('errorFailedOtp') });
        }
      } else {
        setErrors({ userId: t('userNotFound') });
      }
    } else {
      setErrors({ userId: t('userNotFound') });
    }
    setLoading(false);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const otpError = validateOtp(otp);
    if (otpError) newErrors.otp = t(otpError);
    if (!otp) newErrors.otp = t('errorRequired', { fieldName: t('otp') });
    
    const isPasswordValid = Object.values(passwordValidation).every(v => v);
    if (!isPasswordValid) newErrors.newPassword = t('errorPasswordComplexity');
    
    if (newPassword !== confirmPassword) newErrors.confirmPassword = t('errorPasswordsDoNotMatch');
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    setErrors({});
    setLoading(true);
    
    // Simulate updating password in localStorage
    setTimeout(() => {
      const storedUserRaw = localStorage.getItem('saferoot_user');
      if (storedUserRaw) {
        const storedUser = JSON.parse(storedUserRaw);
        if (storedUser.id === userId) {
          const updatedUser = { ...storedUser, password: newPassword };
          localStorage.setItem('saferoot_user', JSON.stringify(updatedUser));
          setStep(3);
        } else {
            setErrors({ form: t('userNotFound') });
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center p-4">
      <header className="w-full flex items-center mb-8">
        <Link to="/login" className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mx-auto">{t('resetPassword')}</h1>
        <div className="w-6"></div>
      </header>

      {step === 1 && (
        <form onSubmit={handleIdSubmit} className="w-full space-y-4 animate-fade-in">
          <p className="text-center text-gray-800 dark:text-gray-300">{t('resetPasswordInstructions')}</p>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-green-200">{t('userId')}</label>
            <Input icon={<UserIcon className="w-5 h-5" />} type="text" placeholder={t('enterId')} value={userId} onChange={handleInputChange(setUserId, 'userId')} isInvalid={!!errors.userId} />
            {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
          </div>
          {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner /> : t('getOtp')}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetSubmit} className="w-full space-y-4 animate-fade-in">
          <p className="text-center text-gray-800 dark:text-gray-300">{t('resetPasswordOtpInstructions')}</p>
          <div>
            <label className="text-sm font-medium">{t('otp')}</label>
            <Input type="text" placeholder={t('enterOtp')} value={otp} onChange={handleInputChange(setOtp, 'otp')} isInvalid={!!errors.otp} required />
            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{t('newPassword')}</label>
            <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterNewPassword')} value={newPassword} onChange={handleInputChange(setNewPassword, 'newPassword')} isInvalid={!!errors.newPassword} required />
            <PasswordStrengthIndicator validation={passwordValidation} />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">{t('confirmNewPassword')}</label>
            <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterNewPassword')} value={confirmPassword} onChange={handleInputChange(setConfirmPassword, 'confirmPassword')} isInvalid={!!errors.confirmPassword} required />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner /> : t('resetPassword')}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-6 animate-fade-in w-full">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('success')}</h2>
          <p className="text-gray-800 dark:text-gray-300">{t('passwordResetSuccess')}</p>
          <Button onClick={() => navigate('/login')} variant="secondary">
            {t('returnToLogin')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordScreen;