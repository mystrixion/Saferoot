import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import { useAuth, useTranslation } from '../../App';

const LabDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('lab')} {t('dashboard')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300">{t('welcome', { name: user?.id || t('lab') })}</h2>
        <p className="text-gray-800 dark:text-gray-400 mt-2">
          This dashboard is where you will manage and upload lab test results.
        </p>
         <p className="text-gray-800 mt-1 text-sm">
          ({t('comingSoon')})
        </p>
      </div>
    </div>
  );
};

export default LabDashboard;