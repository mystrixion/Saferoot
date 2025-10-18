import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../../App';
import FingerprintIcon from '../icons/FingerprintIcon';
import BackspaceIcon from '../icons/BackspaceIcon';
import Spinner from '../common/Spinner';

const MPIN_LENGTH = 4;

const MPINScreen: React.FC = () => {
  const { user, mpinHash, setMpin, unlockApp, forgotMpin } = useAuth();
  const { t } = useTranslation();

  const [mode, setMode] = useState(mpinHash ? 'enter' : 'create'); // 'create', 'confirm', 'enter'
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  const titles: { [key: string]: string } = {
    create: t('createYourMpin'),
    confirm: t('confirmYourMpin'),
    enter: t('enterYourMpin'),
  };

  const handleKeyPress = (key: string) => {
    if (success || isUnlocking) return;
    setError('');
    if (key === 'backspace') {
      setPin(p => p.slice(0, -1));
    } else if (pin.length < MPIN_LENGTH) {
      setPin(p => p + key);
    }
  };

  const handleForgot = () => {
    if (window.confirm(t('forgotMpinConfirmation'))) {
      forgotMpin();
    }
  };

  useEffect(() => {
    if (pin.length !== MPIN_LENGTH) return;

    const processPin = async () => {
      switch (mode) {
        case 'create':
          setFirstPin(pin);
          setPin('');
          setMode('confirm');
          break;
        case 'confirm':
          if (pin === firstPin) {
            setSuccess(t('mpinSetSuccess'));
            setIsUnlocking(true);
            setTimeout(() => setMpin(pin), 1000); // setMpin also unlocks
          } else {
            setError(t('mpinsDoNotMatch'));
            setTimeout(() => {
              setPin('');
              setFirstPin('');
              setMode('create');
              setError('');
            }, 1500);
          }
          break;
        case 'enter':
          if (!user) return;
          // This is a mock hash check. In a real app, use a proper hashing library.
          const expectedHash = `hashed_${pin}_${user.id}`;
          if (expectedHash === mpinHash) {
            setSuccess(t('unlocking'));
            setIsUnlocking(true);
            setTimeout(unlockApp, 1000);
          } else {
            setError(t('incorrectMpin'));
            setTimeout(() => {
              setPin('');
              setError('');
            }, 1500);
          }
          break;
      }
    };
    processPin();
  }, [pin, mode, firstPin, mpinHash, setMpin, unlockApp, user, t]);

  const PinDots = () => (
    <div className="flex justify-center items-center space-x-4 h-8 my-4">
      {Array.from({ length: MPIN_LENGTH }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-200 ${
            pin.length > i ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
          } ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        ></div>
      ))}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );

  type KeypadButtonProps = {
    value: string;
  };

  // FIX: Explicitly type KeypadButton as React.FC to solve an issue where TypeScript
  // would not correctly recognize 'key' as a special prop for components defined
  // inside another component, which was causing a type error during map iteration.
  const KeypadButton: React.FC<KeypadButtonProps> = ({ value }) => (
    <button
      onClick={() => handleKeyPress(value)}
      disabled={isUnlocking}
      className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700/50 rounded-full text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center
                 transition-all transform active:scale-90 active:bg-green-200 dark:active:bg-green-800 disabled:opacity-50"
    >
      {value === 'backspace' ? <BackspaceIcon className="w-7 h-7" /> : value}
    </button>
  );

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-between p-4 h-full animate-fade-in">
      <div className="text-center w-full">
        <div className="bg-green-600 rounded-full p-4 mb-4 inline-block">
          <FingerprintIcon className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'enter' ? t('unlockSafeRoot') : t('mpinSetup')}
        </h1>
        <p className="text-lg text-gray-800 dark:text-green-200 mt-2 min-h-[28px]">
          {isUnlocking && success ? success : error || titles[mode]}
        </p>
        <PinDots />
      </div>
      
      {isUnlocking ? (
        <div className="flex items-center justify-center p-10">
            <Spinner size="h-12 w-12" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
            {'123456789'.split('').map(num => <KeypadButton key={num} value={num} />)}
            <div></div> {/* Placeholder for alignment */}
            <KeypadButton value="0" />
            <KeypadButton value="backspace" />
        </div>
      )}

      <div className="w-full text-center mt-4">
        {mode === 'enter' && !isUnlocking && (
            <button onClick={handleForgot} className="font-semibold text-red-600 hover:underline">
                {t('forgotMpin')}
            </button>
        )}
      </div>
    </div>
  );
};

export default MPINScreen;