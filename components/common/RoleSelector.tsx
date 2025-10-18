import React, { useState } from 'react';
import { UserRole } from '../../types';
import { getRoleExplanation } from '../../services/aiService';
import Tooltip from './Tooltip';
import Spinner from './Spinner';
import InfoIcon from '../icons/InfoIcon';
import { useTranslation } from '../../App';

// Role Icons mapping
import LeafIcon from '../icons/LeafIcon';
import FactoryIcon from '../icons/FactoryIcon';
import LabIcon from '../icons/LabIcon';
import CustomerIcon from '../icons/CustomerIcon';
import UserIcon from '../icons/UserIcon';

interface RoleSelectorProps {
  roles: UserRole[];
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  disabled?: boolean;
}

const roleIcons: Record<string, React.ElementType> = {
  [UserRole.Farmer]: LeafIcon,
  [UserRole.Factory]: FactoryIcon,
  [UserRole.Lab]: LabIcon,
  [UserRole.Customer]: CustomerIcon,
  [UserRole.Admin]: UserIcon,
  [UserRole.AI]: () => null, // AI role should not be displayed
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, selectedRole, onSelectRole, disabled }) => {
  const { t } = useTranslation();
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<UserRole | null>(null);

  const handleShowExplanation = async (role: UserRole) => {
    if (explanations[role] || loadingExplanation === role) return;

    setLoadingExplanation(role);
    try {
      const explanation = await getRoleExplanation(role);
      setExplanations(prev => ({ ...prev, [role]: explanation }));
    } catch (error) {
      console.error(`Failed to fetch explanation for ${role}`, error);
      setExplanations(prev => ({ ...prev, [role]: 'Could not load description.' }));
    } finally {
      setLoadingExplanation(null);
    }
  };

  const InfoIconWithTooltip: React.FC<{ role: UserRole }> = ({ role }) => (
    <div onMouseEnter={() => handleShowExplanation(role)} onFocus={() => handleShowExplanation(role)} className="p-1">
      <Tooltip
        content={
          loadingExplanation === role ? (
            <Spinner size="h-4 w-4" />
          ) : (
            explanations[role] || t('viewDetails')
          )
        }
      >
        <InfoIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />
      </Tooltip>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map(role => {
        const Icon = roleIcons[role];
        if (!Icon) return null;
        const isSelected = selectedRole === role;
        return (
          <div
            key={role}
            onClick={() => !disabled && onSelectRole(role)}
            className={`group relative flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
              ${isSelected
                ? 'bg-green-100 dark:bg-green-900/50 border-green-600 dark:border-green-400 shadow-md'
                : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600 hover:border-green-500 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 transition-colors ${isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className={`font-semibold transition-colors ${isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-300'}`}>{t(role.toLowerCase())}</span>
            </div>
             <div onClick={(e) => e.stopPropagation()}>
                <InfoIconWithTooltip role={role} />
             </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleSelector;
