import React from 'react';
import { useTranslation } from '../../App';
import { PasswordValidationResult } from '../../utils/validation';
import CheckIcon from '../icons/CheckIcon';
import XCircleIcon from '../icons/XCircleIcon';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ validation }) => {
  const { t } = useTranslation();

  const criteria = [
    { key: 'length', text: t('criteriaLength'), valid: validation.length },
    { key: 'uppercase', text: t('criteriaUppercase'), valid: validation.uppercase },
    { key: 'lowercase', text: t('criteriaLowercase'), valid: validation.lowercase },
    { key: 'number', text: t('criteriaNumber'), valid: validation.number },
    { key: 'special', text: t('criteriaSpecial'), valid: validation.special },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
      {criteria.map(item => (
        <div key={item.key} className={`flex items-center ${item.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {item.valid ? (
            <CheckIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          ) : (
            <XCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          )}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthIndicator;