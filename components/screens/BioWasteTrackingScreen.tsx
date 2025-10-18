import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useTranslation } from '../../App';
import Button from '../common/Button';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import TruckIcon from '../icons/TruckIcon';
import ProcessingIcon from '../icons/ProcessingIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import Spinner from '../common/Spinner';

interface Status {
  nameKey: string;
  description: string;
  icon: React.ElementType;
}

const STATUSES: Status[] = [
  { nameKey: 'pendingPickup', description: 'Request received, awaiting collection.', icon: Spinner },
  { nameKey: 'inTransit', description: 'Waste is being transported to the facility.', icon: TruckIcon },
  { nameKey: 'processing', description: 'Waste is being processed at the facility.', icon: ProcessingIcon },
  { nameKey: 'disposed', description: 'Disposal complete. Thank you!', icon: CheckCircleIcon },
];

const BioWasteTrackingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { bioWasteSubmission, setBioWasteSubmission } = useAppState();
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (currentStatusIndex < STATUSES.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatusIndex(prevIndex => prevIndex + 1);
      }, 2500); // Update status every 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentStatusIndex]);

  const handleDone = () => {
    setBioWasteSubmission(null); // Clear the submission from state
    navigate('/select-role');
  }

  if (!bioWasteSubmission) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl items-center justify-center p-6">
        <h2 className="text-xl font-bold">No bio-waste data found.</h2>
        <p className="text-gray-800 dark:text-gray-400 mt-2 mb-6">Please submit a routing request first.</p>
        <Button variant="secondary" onClick={() => navigate('/biowaste/route')}>{t('routeBioWaste')}</Button>
      </div>
    );
  }

  const { type, quantity, location, batchId } = bioWasteSubmission;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={() => navigate('/biowaste/route')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('trackingDisposal')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow p-6 overflow-y-auto">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg mb-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-200">{t('submissionDetails')}</h3>
            <p className="text-sm text-gray-800 dark:text-gray-400">{quantity}kg of {type}</p>
            <p className="text-sm text-gray-800 dark:text-gray-400">From: {location}</p>
            {batchId && <p className="text-sm text-gray-800 dark:text-gray-400">{t('batchId')}: {batchId}</p>}
        </div>

        <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-200 mb-4">{t('disposalPath')}</h3>
            <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute top-4 bottom-4 left-[15px] w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                {STATUSES.map((status, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isPending = index > currentStatusIndex;
                    
                    return (
                        <div key={status.nameKey} className="flex items-start space-x-4 mb-6 relative">
                            <div className={`z-10 h-8 w-8 flex items-center justify-center rounded-full ${isCurrent ? 'bg-green-100 dark:bg-green-900/50 animate-pulse' : (isCompleted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-100 dark:bg-gray-700')}`}>
                                <status.icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : isCurrent ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <p className={`font-bold ${isPending ? 'text-gray-500' : 'text-gray-900 dark:text-gray-200'}`}>{t(status.nameKey)}</p>
                                {!isPending && <p className="text-sm text-gray-800 dark:text-gray-400">{status.description}</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
      
      {currentStatusIndex === STATUSES.length - 1 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <Button variant="secondary" onClick={handleDone}>
                {t('done')}
            </Button>
        </div>
      )}
    </div>
  );
};

export default BioWasteTrackingScreen;