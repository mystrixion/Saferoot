import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useTranslation } from '../../App';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setProductId } = useAppState();
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useTranslation();

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning a QR code
    setTimeout(() => {
      const mockProductId = `SR-HERB-${Math.floor(10000 + Math.random() * 90000)}`;
      setProductId(mockProductId);
      setIsScanning(false);
      navigate('/journey/customer');
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('scanProduct')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <p className="text-gray-800 dark:text-gray-400 mb-6">
          {t('scanProductPrompt')}
        </p>

        <div className="w-64 h-64 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Scanner reticle */}
            <div className="absolute top-4 left-4 border-t-4 border-l-4 border-green-400 w-8 h-8"></div>
            <div className="absolute top-4 right-4 border-t-4 border-r-4 border-green-400 w-8 h-8"></div>
            <div className="absolute bottom-4 left-4 border-b-4 border-l-4 border-green-400 w-8 h-8"></div>
            <div className="absolute bottom-4 right-4 border-b-4 border-r-4 border-green-400 w-8 h-8"></div>
            
            {/* Animated scanning line */}
            <div className="absolute top-0 w-full h-1 bg-green-400/80 shadow-[0_0_10px_#4ade80] animate-[scan_2s_ease-in-out_infinite]"></div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(250px); }
                    100% { transform: translateY(0); }
                }
            `}</style>

            <p className="text-gray-500 z-10">{t('simulatedCamera')}</p>
        </div>

        <div className="w-full mt-8">
          <Button variant="secondary" onClick={handleScan} disabled={isScanning}>
            {isScanning ? <Spinner /> : t('simulateScan')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;