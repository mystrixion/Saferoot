import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTranslation } from '../../App';
import { Language } from '../../translations';
import { generateOTP } from '../../services/aiService';
import { validatePassword, validateOtp, PasswordValidationResult } from '../../utils/validation';

import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import UserIcon from '../icons/UserIcon';
import ShieldIcon from '../icons/ShieldIcon';
import LockIcon from '../icons/LockIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

const UserProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePassword(''));
  
  useEffect(() => {
      setPasswordValidation(validatePassword(passwordData.new));
      if (passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm) {
          setErrors(prev => ({...prev, confirm: t('errorPasswordsDoNotMatch')}));
      } else {
          setErrors(prev => ({...prev, confirm: ''}));
      }
  }, [passwordData.new, passwordData.confirm, t]);


  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (passwordData.current !== user.password) {
        setErrors({ current: t('wrongPassword')});
        return;
    }
    const isNewPasswordValid = Object.values(passwordValidation).every(v => v);
    if (!isNewPasswordValid) {
        setErrors({ new: t('errorPasswordComplexity') });
        return;
    }
     if (passwordData.new !== passwordData.confirm) {
        setErrors({ confirm: t('errorPasswordsDoNotMatch') });
        return;
    }

    setLoading(true);
    try {
        await generateOTP(); // Simulate sending OTP
        setModalStep(2);
    } catch (err) {
        setErrors({ form: 'Failed to send OTP. Please try again.' });
    } finally {
        setLoading(false);
    }
  };

  const handleOtpConfirm = (e: React.FormEvent) => {
      e.preventDefault();
      const otpError = validateOtp(otp);
      if (otpError) {
          setErrors({ otp: t(otpError) });
          return;
      }
      setErrors({});
      setLoading(true);
      // Simulate OTP check and password update
      setTimeout(() => {
          const updatedUser = { ...user, password: passwordData.new };
          login(updatedUser); // Update user in context and localStorage
          setSuccess(t('passwordChangedSuccess'));
          setLoading(false);
          setModalStep(3); // Success step
          setTimeout(() => {
              closeModal();
          }, 2000);
      }, 1000);
  };
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
        setModalStep(1);
        setPasswordData({ current: '', new: '', confirm: '' });
        setOtp('');
        setErrors({});
        setSuccess('');
    }, 300);
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center p-4 bg-green-700 text-white sticky top-0 z-10">
          <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold mx-auto">{t('userProfile')}</h1>
          <div className="w-6"></div>
        </header>

        <div className="flex-grow p-4 overflow-y-auto space-y-6">
          {/* Profile Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-200">{t('profileDetails')}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-gray-200">{user.id} ({t(user.role.toLowerCase())})</span>
              </div>
            </div>
          </div>
          
          {/* Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-200">{t('settings')}</h2>
            <div className="space-y-4">
               <div>
                  <label htmlFor="language-select" className="block text-sm font-medium text-gray-800 dark:text-gray-400 mb-1">{t('language')}</label>
                  <Select
                      id="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200 !border-gray-300 dark:!border-gray-600"
                  >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                  </Select>
               </div>
            </div>
          </div>
          
           {/* Security Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-200">{t('security')}</h2>
            <div className="space-y-4">
              <Button variant="outline" onClick={openModal}>
                <div className="flex items-center justify-center gap-2">
                  <ShieldIcon className="h-5 w-5" />
                  <span>{t('changePassword')}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={t('changePassword')}>
        <div className="min-h-[350px]">
          {modalStep === 1 && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t('currentPassword')}</label>
                <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterCurrentPassword')} value={passwordData.current} onChange={e => setPasswordData(p => ({...p, current: e.target.value}))} isInvalid={!!errors.current} required/>
                {errors.current && <p className="text-red-500 text-xs mt-1">{errors.current}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('newPassword')}</label>
                <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterNewPassword')} value={passwordData.new} onChange={e => setPasswordData(p => ({...p, new: e.target.value}))} isInvalid={!!errors.new} required/>
                <PasswordStrengthIndicator validation={passwordValidation} />
                 {errors.new && <p className="text-red-500 text-xs mt-1">{errors.new}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">{t('confirmNewPassword')}</label>
                <Input icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('enterNewPassword')} value={passwordData.confirm} onChange={e => setPasswordData(p => ({...p, confirm: e.target.value}))} isInvalid={!!errors.confirm} required/>
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
              </div>
              {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
              <div className="pt-4">
                <Button variant="secondary" type="submit" disabled={loading}>
                  {loading ? <Spinner /> : t('getOtp')}
                </Button>
              </div>
            </form>
          )}
          {modalStep === 2 && (
            <form onSubmit={handleOtpConfirm} className="space-y-4">
              <p className="text-center text-gray-800 dark:text-gray-300">{t('otpSent')}</p>
              <div>
                <label className="text-sm font-medium">{t('otp')}</label>
                <Input type="text" placeholder={t('enterOtpToConfirm')} value={otp} onChange={e => setOtp(e.target.value)} isInvalid={!!errors.otp} required />
                {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              </div>
              <div className="pt-4">
                <Button variant="secondary" type="submit" disabled={loading}>
                  {loading ? <Spinner /> : t('updatePassword')}
                </Button>
              </div>
            </form>
          )}
          {modalStep === 3 && (
            <div className="text-center space-y-6">
                <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('success')}</h2>
                <p className="text-gray-800 dark:text-gray-300">{success}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default UserProfileScreen;