import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import UserIcon from '../icons/UserIcon';
import LockIcon from '../icons/LockIcon';
import { UserRole } from '../../types';
import { sendRegistrationRequestEmail } from '../../services/emailService';
import { useTranslation } from '../../App';
import ThemeToggleButton from '../common/ThemeToggleButton';
import { validatePassword, validateRequired, validateUserId, PasswordValidationResult } from '../../utils/validation';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';
import FileTextIcon from '../icons/FileTextIcon';
import XIcon from '../icons/XIcon';
import RoleSelector from '../common/RoleSelector';

const MOCK_EXISTING_USER_IDS = ['admin', 'alicef', 'bobfact', 'testuser'];
const registerableRoles = [UserRole.Farmer, UserRole.Factory, UserRole.Lab, UserRole.Customer];

const RegistrationScreen: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.Farmer);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idProof, setIdProof] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserIdChecking, setIsUserIdChecking] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePassword(''));
  const [isFormValid, setIsFormValid] = useState(false);

  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validateForm = useCallback(async (isSubmitting = false): Promise<boolean> => {
    const newErrors: { [key: string]: string } = {};
    let isUserIdValid = false;

    // Name
    const nameError = validateRequired(name);
    if (nameError) newErrors.name = t(nameError, { fieldName: t('fullName') });

    // User ID
    const userIdError = validateRequired(userId);
    if (userIdError) {
      newErrors.userId = t(userIdError, { fieldName: t('userId') });
    } else {
      setIsUserIdChecking(true);
      const asyncUserIdError = await validateUserId(userId, MOCK_EXISTING_USER_IDS);
      setIsUserIdChecking(false);
      if (asyncUserIdError) {
        newErrors.userId = t(asyncUserIdError, { length: 3 });
      } else {
        isUserIdValid = true;
      }
    }
    
    // Password
    const pwValidation = validatePassword(password);
    const isPasswordValid = Object.values(pwValidation).every(v => v);
    if (!isPasswordValid) newErrors.password = t('errorPasswordComplexity');
    
    // ID Proof
    const idProofError = validateRequired(idProof);
    if (idProofError) newErrors.idProof = t(idProofError, { fieldName: t('uploadIdProof') });
    
    setErrors(newErrors);

    const formIsValid = Object.keys(newErrors).length === 0 && isUserIdValid;
    setIsFormValid(formIsValid);
    return formIsValid;

  }, [name, userId, password, idProof, t]);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Auto-validate form fields that have been touched
      if (Object.keys(touched).length > 0) {
        validateForm();
      }
    }, 500); // Debounce validation
    return () => clearTimeout(handler);
  }, [name, userId, password, idProof, touched, validateForm]);
  
  useEffect(() => {
    setPasswordValidation(validatePassword(password));
  }, [password]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdProof(file);
    setFileName(file ? file.name : '');
    setTouched(prev => ({ ...prev, idProof: true }));

    setImagePreviewUrl(null); // Reset preview
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveIdProof = () => {
    setIdProof(null);
    setFileName('');
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    // Re-touch the field so the error message shows up again
    setTouched(prev => ({ ...prev, idProof: true }));
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, userId: true, password: true, idProof: true });
    
    const isValid = await validateForm(true);
    if (!isValid) {
        return;
    }
    setSuccess('');
    setIsLoading(true);
    
    try {
      await sendRegistrationRequestEmail({ name, userId, role });
      setSuccess(t('registrationSubmitted'));
      
      setTimeout(() => {
          navigate('/login');
      }, 3000);
    } catch (err) {
      setErrors({ form: 'Registration failed. Please try again.'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center relative p-4">
      <div className="absolute top-0 right-0 p-2">
        <ThemeToggleButton className="focus:ring-green-500/50 dark:focus:ring-white/50 focus:ring-offset-transparent" />
      </div>
      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t('register')}</h1>
      <p className="text-lg text-gray-800 dark:text-green-200 mb-8">{t('joinTheNetwork')}</p>

      {success ? (
        <div className="text-center p-4 bg-green-600 rounded-lg text-white">
          <p className="font-bold">{t('success')}</p>
          <p>{success}</p>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="w-full space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-green-200 mb-2">{t('selectRole')}</label>
            <RoleSelector
              roles={registerableRoles}
              selectedRole={role}
              onSelectRole={setRole}
              disabled={isLoading}
            />
          </div>
          <div>
            <Input name="name" type="text" placeholder={t('fullName')} value={name} onChange={e => setName(e.target.value)} onBlur={handleBlur} disabled={isLoading} isInvalid={touched.name && !!errors.name} />
            {touched.name && errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="relative">
            <Input name="userId" icon={<UserIcon className="w-5 h-5" />} type="text" placeholder={t('userId')} value={userId} onChange={e => setUserId(e.target.value)} onBlur={handleBlur} disabled={isLoading} isInvalid={touched.userId && !!errors.userId} />
            {isUserIdChecking && <Spinner size="h-4 w-4" className="absolute right-3 top-4" />}
            {touched.userId && errors.userId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.userId}</p>}
          </div>
          <div>
            <Input name="password" icon={<LockIcon className="w-5 h-5" />} type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} onBlur={handleBlur} disabled={isLoading} isInvalid={touched.password && !!errors.password} />
            <PasswordStrengthIndicator validation={passwordValidation} />
            {touched.password && errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-green-200 mb-1">{t('uploadIdProof')}</label>
            <input
              name="idProof"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              onBlur={handleBlur}
              className="hidden"
              accept="image/*,.pdf"
            />
            {idProof ? (
              <div className="relative p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-between animate-fade-in-fast">
                <div className="flex items-center gap-3 overflow-hidden">
                  {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="ID proof preview" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <FileTextIcon className="h-10 w-10 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                  <p className="text-sm text-gray-900 dark:text-gray-200 truncate" title={fileName}>{fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveIdProof}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-2"
                  aria-label="Remove ID proof"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={`w-full text-center py-6 px-4 bg-white/70 dark:bg-green-900/50 border-2 border-dashed rounded-xl hover:border-green-500 dark:hover:border-green-500 transition-all duration-150 ease-in-out ${touched.idProof && errors.idProof ? 'border-red-500' : 'border-green-400 dark:border-green-600'}`}
              >
                <span className="text-gray-700 dark:text-gray-400">{t('clickToUpload')}</span>
              </button>
            )}
            {touched.idProof && errors.idProof && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.idProof}</p>}
          </div>
          
          {errors.form && <p className="text-red-500 dark:text-red-400 text-sm text-center">{errors.form}</p>}

          <div className="pt-4">
            <Button variant="primary" type="submit" disabled={isLoading || !isFormValid}>
              {isLoading ? <Spinner /> : t('register')}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <span className="text-gray-800 dark:text-green-200">{t('alreadyHaveAccount')} </span>
        <button onClick={() => navigate('/login')} className="font-bold text-gray-900 dark:text-white hover:underline">
          {t('loginHere')}
        </button>
      </div>
    </div>
  );
};

export default RegistrationScreen;
