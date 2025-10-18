import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../common/Spinner';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LeafIcon from '../icons/LeafIcon';
import FactoryIcon from '../icons/FactoryIcon';
import LabIcon from '../icons/LabIcon';
import CustomerIcon from '../icons/CustomerIcon';
import AIIcon from '../icons/AIIcon';
import UserIcon from '../icons/UserIcon';
import { UserRole } from '../../types';
import { verifyRejection } from '../../services/aiService';
import { sendRegistrationDecisionEmail } from '../../services/emailService';
import { useTranslation } from '../../App';

interface PendingRequest {
    id: string;
    name: string;
    userId: string;
    role: UserRole;
    idProof: string;
}

const MOCK_REQUESTS: PendingRequest[] = [
    { id: 'req1', name: 'Alice Farmer', userId: 'alicef', role: UserRole.Farmer, idProof: 'id_proof_alice.pdf' },
    { id: 'req2', name: 'Bob Factory', userId: 'bobfact', role: UserRole.Factory, idProof: 'id_proof_bob.jpg' },
    { id: 'req4', name: 'Diana Lab', userId: 'dianal', role: UserRole.Lab, idProof: 'id_proof_diana.pdf' },
    { id: 'req5', name: 'Evan Customer', userId: 'evanc', role: UserRole.Customer, idProof: 'id_proof_evan.jpg' },
    { id: 'req3', name: 'Charlie Farmer', userId: 'charlief', role: UserRole.Farmer, idProof: 'id_proof_charlie.png' },
];

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<PendingRequest[]>(MOCK_REQUESTS);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isIdModalOpen, setIdModalOpen] = useState(false);
  const [isModalContentLoading, setIsModalContentLoading] = useState(false);
  const [isRejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState<{ justified: boolean; reason: string } | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const roleIcons: Record<string, React.ElementType> = {
    [UserRole.Farmer]: LeafIcon,
    [UserRole.Factory]: FactoryIcon,
    [UserRole.Lab]: LabIcon,
    [UserRole.Customer]: CustomerIcon,
    [UserRole.Admin]: UserIcon,
    [UserRole.AI]: AIIcon,
  };

  const handleApprove = async (request: PendingRequest) => {
    setLoadingAction(`approve-${request.id}`);
    console.log(`Approving request ${request.id}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await sendRegistrationDecisionEmail({ name: request.name, userId: request.userId, role: request.role, decision: 'approved' });
    setRequests(prev => prev.filter(req => req.id !== request.id));
    setLoadingAction(null);
  };

  const handleRejectClick = async (request: PendingRequest) => {
    setLoadingAction(`reject-${request.id}`);
    setSelectedRequest(request);
    console.log(`Rejecting request ${request.id}, pending AI verification.`);
    const aiVerification = await verifyRejection(request.name, request.userId, request.role, request.idProof);
    setRejectionDetails(aiVerification);
    setRejectionModalOpen(true);
    setLoadingAction(null);
  };

  const confirmRejection = async () => {
    if (!selectedRequest) return;
    setLoadingAction(`confirm-reject-${selectedRequest.id}`);
    
    console.log(`--- AI REJECTION VERIFICATION RESULT for ${selectedRequest.userId} ---`);
    console.log(`Reason: ${rejectionDetails?.reason}`);
    console.log("-------------------------------------------------");
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate final action
    await sendRegistrationDecisionEmail({ name: selectedRequest.name, userId: selectedRequest.userId, role: selectedRequest.role, decision: 'rejected' });
    setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
    
    setRejectionModalOpen(false);
    setLoadingAction(null);
    setSelectedRequest(null);
    setRejectionDetails(null);
  };

  const handleViewId = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIdModalOpen(true);
    setIsModalContentLoading(true);
    // Simulate loading the ID proof content
    setTimeout(() => {
        setIsModalContentLoading(false);
    }, 500);
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-green-700 text-white sticky top-0 z-10">
          <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
             <h1 className="text-xl font-bold">{t('adminDashboard')}</h1>
             {requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {requests.length}
                </span>
             )}
          </div>
          <div className="w-6"></div>
        </header>

        <div className="flex-grow p-4 overflow-y-auto">
          <h2 className="text-md font-semibold text-gray-900 dark:text-gray-400 mb-4 px-2">{t('pendingRegistrations')}</h2>
          {requests.length > 0 ? (
            <ul className="space-y-4">
              {requests.map(req => {
                const Icon = roleIcons[req.role] || UserIcon;
                return (
                <li key={req.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-shadow hover:shadow-md">
                    <div className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <Icon className="h-6 w-6 text-green-700 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{req.name}</p>
                                <p className="text-sm text-gray-800 dark:text-gray-400">
                                    <span className="font-semibold">{t('userId')}:</span> {req.userId}
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-400">
                                    <span className="font-semibold">{t('role')}:</span> {t(req.role.toLowerCase())}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <button 
                                className="text-sm font-semibold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline" 
                                onClick={() => handleViewId(req)}
                                disabled={!!loadingAction}
                                >
                                {t('viewIdProof')}: <span className="font-normal italic">{req.idProof}</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                        <button 
                            onClick={() => handleRejectClick(req)} 
                            disabled={!!loadingAction} 
                            className="flex-1 flex items-center justify-center text-center py-3 px-4 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150 ease-in-out transform active:scale-95 border-r border-gray-200 dark:border-gray-700 rounded-bl-xl disabled:opacity-50">
                            {loadingAction === `reject-${req.id}` ? <Spinner size="h-5 w-5" /> : t('reject')}
                        </button>
                        <button 
                            onClick={() => handleApprove(req)} 
                            disabled={!!loadingAction} 
                            className="flex-1 flex items-center justify-center text-center py-3 px-4 text-green-700 font-bold hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-150 ease-in-out transform active:scale-95 rounded-br-xl disabled:opacity-50">
                            {loadingAction === `approve-${req.id}` ? <Spinner size="h-5 w-5" /> : t('approve')}
                        </button>
                    </div>
                </li>
              )})}
            </ul>
          ) : (
            <div className="text-center text-gray-800 dark:text-gray-400 py-8">
                <h3 className="text-lg font-semibold">{t('allClear')}</h3>
                <p>{t('noPendingRegistrations')}</p>
            </div>
          )}
        </div>
      </div>
      
      <Modal isOpen={isIdModalOpen} onClose={() => setIdModalOpen(false)} title={t('viewIdProof')}>
        {isModalContentLoading ? (
            <div className="flex justify-center items-center h-48">
                <Spinner size="h-8 w-8" />
            </div>
        ) : (
            selectedRequest && (
                <div>
                    <p className="text-gray-800 dark:text-gray-400 mb-4">
                        In a real application, this would display the user's uploaded ID document. For this simulation, only the filename is shown.
                    </p>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center border dark:border-gray-600">
                        <p className="font-mono text-gray-900 dark:text-gray-200 text-lg break-all">{selectedRequest.idProof}</p>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-400 mt-2">
                        Admins are responsible for verifying this document through secure, established procedures.
                    </p>
                    <div className="mt-6">
                        <Button variant="secondary" onClick={() => setIdModalOpen(false)}>{t('close')}</Button>
                    </div>
                </div>
            )
        )}
      </Modal>

      <Modal isOpen={isRejectionModalOpen} onClose={() => setRejectionModalOpen(false)} title={t('confirmRejection')}>
        {selectedRequest && rejectionDetails && (
            <div className="space-y-4">
                <p className="text-gray-800 dark:text-gray-300">{t('confirmRejectionPrompt', { name: selectedRequest.name })}</p>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-400">{t('aiComplianceCheck')}</p>
                    <p className="text-sm text-gray-900 dark:text-gray-200 mt-1">{rejectionDetails.reason}</p>
                </div>
                <div className="flex space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setRejectionModalOpen(false)} disabled={!!loadingAction} className="flex-1 !text-gray-700 !border-gray-300 hover:!bg-gray-100 dark:!text-gray-300 dark:!border-gray-500 dark:hover:!bg-gray-600 disabled:opacity-50">{t('cancel')}</Button>
                    <Button variant="secondary" onClick={confirmRejection} disabled={!!loadingAction} className="flex-1 !bg-red-600 hover:!bg-red-700">
                      {loadingAction === `confirm-reject-${selectedRequest.id}` ? <Spinner size="h-4 w-4" /> : t('confirmRejection')}
                    </Button>
                </div>
            </div>
        )}
      </Modal>
    </>
  );
};

export default AdminDashboard;
