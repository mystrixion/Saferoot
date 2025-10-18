import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useTranslation } from '../../App';
import Button from '../common/Button';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import HarvestIcon from '../icons/HarvestIcon';
import BeakerIcon from '../icons/BeakerIcon';
import FactoryIcon from '../icons/FactoryIcon';
import PackageIcon from '../icons/PackageIcon';
import TruckIcon from '../icons/TruckIcon';
import AwardIcon from '../icons/AwardIcon';
import { ProductJourneyStep } from '../../types';

const ProductJourneyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { productId, setProductId } = useAppState();
  const { t } = useTranslation();

  const MOCK_JOURNEY_DATA: ProductJourneyStep[] = [
    { 
        nameKey: 'harvested', 
        date: '2024-07-15', 
        location: 'Green Valley Farms', 
        details: 'Batch #FARM-451, Tulsi (Holy Basil)',
        icon: HarvestIcon,
        rewardPoints: 10,
    },
    { 
        nameKey: 'labTested', 
        date: '2024-07-16', 
        location: 'AgriSafe Labs', 
        details: 'Passed all quality checks. Confidence: 98.7%',
        icon: BeakerIcon
    },
    { 
        nameKey: 'processed', 
        date: '2024-07-18', 
        location: 'HerbalCare Factory', 
        details: 'Processed into final product form. Batch #FACT-982',
        icon: FactoryIcon,
        rewardPoints: 10,
    },
    { 
        nameKey: 'packaged', 
        date: '2024-07-19', 
        location: 'HerbalCare Factory', 
        details: 'Packaged and sealed for quality assurance.',
        icon: PackageIcon
    },
    { 
        nameKey: 'shipped', 
        date: '2024-07-20', 
        location: 'Central Distribution Hub', 
        details: 'Shipped to retailer. Tracking #SHP-675',
        icon: TruckIcon
    },
  ];

  const handleDone = () => {
    setProductId(null);
    navigate('/dashboard/customer');
  };

  if (!productId) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl items-center justify-center p-6">
        <h2 className="text-xl font-bold">No product data found.</h2>
        <p className="text-gray-800 dark:text-gray-400 mt-2 mb-6">Please scan a product QR code first.</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard/customer')}>Go to Scanner</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={handleDone} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('productJourney')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow p-6 overflow-y-auto">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg mb-6 text-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-200">{t('productId')}</h3>
            <p className="text-sm text-gray-800 dark:text-gray-400 font-mono">{productId}</p>
        </div>

        <div>
            <div className="relative pl-4">
                <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-green-200 dark:bg-green-700/50"></div>
                {MOCK_JOURNEY_DATA.map((step) => (
                    <div key={step.nameKey} className="flex items-start space-x-4 mb-6 relative animate-fade-in">
                        <div className="z-10 h-8 w-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                            <step.icon className="h-5 w-5 text-green-700 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-200">{t(step.nameKey)}</p>
                            <p className="text-xs text-gray-800 dark:text-gray-400">{step.date} - {step.location}</p>
                            <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">{step.details}</p>
                            {step.rewardPoints && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-0.5 rounded-full w-fit">
                                    <AwardIcon className="h-3 w-3" />
                                    <span>+{step.rewardPoints} {t('qualityPoints')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleDone}>
              {t('scanAnotherProduct')}
          </Button>
      </div>
    </div>
  );
};

export default ProductJourneyScreen;