import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ShieldIcon from '../icons/ShieldIcon';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import { useAppState, useTranslation, useAuth } from '../../App';
import { UserRole } from '../../types';

const VerificationScreen: React.FC = () => {
    const navigate = useNavigate();
    const { verificationResult, setBatchDetails, setVerificationResult } = useAppState();
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const [isRegistering, setIsRegistering] = useState(false);

    const handleRegisterBatch = async () => {
        if (!verificationResult || !user) return;
        setIsRegistering(true);
        // Simulate blockchain transaction delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate a mock blockchain hash
        const blockchainHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

        const pointsToAward = 10;
        let rewardPointsEarned;

        // Award points if verification passed for Farmer or Factory
        if (verificationResult.passed && (user.role === UserRole.Farmer || user.role === UserRole.Factory)) {
            const currentPoints = user.rewardPoints || 0;
            updateUser({ rewardPoints: currentPoints + pointsToAward });
            rewardPointsEarned = pointsToAward;
        }

        setBatchDetails({ ...verificationResult, blockchainHash, rewardPointsEarned });
        setIsRegistering(false);
        navigate('/qrcode');
    };
    
    const handleGoBack = () => {
        setVerificationResult(null);
        navigate('/dashboard/farmer');
    }

    if (!verificationResult) {
        return (
            <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl items-center justify-center p-6">
                <h2 className="text-xl font-bold">{t('noVerificationData')}</h2>
                <p className="text-gray-800 dark:text-gray-400 mt-2 mb-6">{t('pleaseSubmitHarvest')}</p>
                <Button variant="secondary" onClick={() => navigate('/dashboard/farmer')}>{t('submitHarvest')}</Button>
            </div>
        );
    }
    
    const { passed, confidence, details } = verificationResult;

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
             <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
                <button onClick={handleGoBack} className="p-2 -ml-2">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold mx-auto">{t('verificationResult')}</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className={`rounded-full p-4 mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    <ShieldIcon className={`h-12 w-12 ${passed ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300">{t('aiVerify')}</h2>
                <p className={`text-4xl font-bold mt-4 ${passed ? 'text-green-600' : 'text-red-500'}`}>
                    {passed ? t('verificationPassed') : t('verificationFailed')}
                </p>
                <div className="mt-4 text-gray-800 dark:text-gray-400">
                    <span className="font-semibold">{t('confidence')}:</span> {confidence}%
                </div>

                <div className="w-full mt-10 space-y-4">
                    {passed ? (
                         <Button variant="secondary" onClick={handleRegisterBatch} disabled={isRegistering}>
                            {isRegistering ? <Spinner/> : t('registerOnBlockchain')}
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={handleGoBack}>
                            {t('tryAgain')}
                        </Button>
                    )}
                    <button className="w-full font-semibold text-green-700 dark:text-green-400 hover:underline" onClick={() => alert(details)}>
                        {t('viewDetails')}
                    </button>
                </div>
            </div>
             <footer className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                    <ShieldIcon className="h-6 w-6" />
                    <span className="text-lg font-bold">{t('saferoot')}</span>
                </div>
            </footer>
        </div>
    );
};

export default VerificationScreen;