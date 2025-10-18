export const validateRequired = (value: string | File | null): string => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'errorRequired';
  }
  return '';
};

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'errorInvalidEmail';
  }
  return '';
};

export const validateUserId = async (userId: string, existingIds: string[]): Promise<string> => {
  if (userId.length < 3) return 'errorMinLength';
  if (!/^[a-zA-Z0-9_]+$/.test(userId)) return 'errorUserIdFormat';
  
  // Simulate async check for uniqueness
  await new Promise(resolve => setTimeout(resolve, 300));
  if (existingIds.includes(userId.toLowerCase())) return 'errorUserIdTaken';

  return '';
};

export interface PasswordValidationResult {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

export const validateNumber = (value: string): string => {
    if (isNaN(Number(value)) || Number(value) <= 0) {
        return 'errorMustBePositive';
    }
    return '';
};

export const validateOtp = (otp: string): string => {
    if (!/^\d{6}$/.test(otp)) {
        return 'errorOtpLength';
    }
    return '';
};
