import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppState, useTranslation } from '../../App';
import Button from '../common/Button';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import DownloadIcon from '../icons/DownloadIcon';

const QrCodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { batchDetails, setBatchDetails, setVerificationResult } = useAppState();
  const { t } = useTranslation();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDone = () => {
    // Clear state before navigating away
    setBatchDetails(null);
    setVerificationResult(null);
    navigate('/select-role');
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${batchDetails?.batchId || 'saferoot-qr'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!batchDetails) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl items-center justify-center p-6">
        <h2 className="text-xl font-bold">{t('noBatchData')}</h2>
        <Button variant="secondary" onClick={() => navigate('/dashboard/farmer')}>{t('returnToDashboard')}</Button>
      </div>
    );
  }

  const { batchId, herbSpecies, blockchainHash } = batchDetails;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={handleDone} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('qrCodeGenerated')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300">{t('batchRegistered')}</h2>
        <p className="text-gray-800 dark:text-gray-400 mt-1 mb-6">{herbSpecies} - Batch {batchId}</p>

        <div className="p-4 bg-white rounded-lg shadow-inner" ref={qrRef}>
          <QRCodeCanvas
            value={JSON.stringify({ batchId, blockchainHash })}
            size={220}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={false}
          />
        </div>

        <div className="w-full mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-400">{t('blockchainId')}</p>
            <p className="font-mono text-xs break-all text-gray-900 dark:text-gray-200">{blockchainHash}</p>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleDownload}>
             <div className="flex items-center justify-center gap-2">
                <DownloadIcon className="h-5 w-5" />
                <span>{t('downloadQrCode')}</span>
              </div>
          </Button>
          <Button variant="secondary" onClick={handleDone}>
              {t('done')}
          </Button>
      </div>
    </div>
  );
};

export default QrCodeScreen;