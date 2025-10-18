import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useTranslation } from '../../App';
import { ROLE_ACTIONS } from '../../constants';
import { searchAll } from '../../services/searchService';
import { getRoleExplanation } from '../../services/aiService'; // Import the new service
import { UserRole, SearchResults, Product, Batch, User } from '../../types';

import Button from '../common/Button';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import Spinner from '../common/Spinner';
import ThemeToggleButton from '../common/ThemeToggleButton';
import Tooltip from '../common/Tooltip'; // Import Tooltip component
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import CogIcon from '../icons/CogIcon';
import InfoIcon from '../icons/InfoIcon'; // Import InfoIcon
import AwardIcon from '../icons/AwardIcon';

// Icons for search results
import LeafIcon from '../icons/LeafIcon';
import FactoryIcon from '../icons/FactoryIcon';
import LabIcon from '../icons/LabIcon';
import CustomerIcon from '../icons/CustomerIcon';
import UserIcon from '../icons/UserIcon';
import AIIcon from '../icons/AIIcon';
import PackageIcon from '../icons/PackageIcon';
import BeakerIcon from '../icons/BeakerIcon';


const RoleSelectionScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleExplanation, setRoleExplanation] = useState('');
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (user?.role) {
        setIsExplanationLoading(true);
        try {
          const explanation = await getRoleExplanation(user.role);
          setRoleExplanation(explanation);
        } catch (error) {
          console.error("Failed to fetch role explanation:", error);
          setRoleExplanation(t('errorFailedToLoad')); // Fallback text
        } finally {
          setIsExplanationLoading(false);
        }
      }
    };
    fetchExplanation();
  }, [user?.role, t]);


  if (!user) {
    navigate('/login');
    return null;
  }
  
  const roleIcons: Record<string, React.ElementType> = {
    [UserRole.Farmer]: LeafIcon,
    [UserRole.Factory]: FactoryIcon,
    [UserRole.Lab]: LabIcon,
    [UserRole.Customer]: CustomerIcon,
    [UserRole.Admin]: UserIcon, // Using generic user for Admin
    [UserRole.AI]: AIIcon,
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearchLoading(true);
    setIsResultsModalOpen(true);
    const results = await searchAll(query);
    setSearchResults(results);
    setIsSearchLoading(false);
  };

  const closeSearchModal = () => {
    setIsResultsModalOpen(false);
    // Delay clearing to allow modal to animate out
    setTimeout(() => {
        setSearchResults(null);
        setSearchQuery('');
    }, 300);
  };

  const actions = ROLE_ACTIONS[user.role] || [];
  const welcomeMessage = t('welcome', { name: user.id });

  const actionNameKeyMap: { [key: string]: string } = {
    'Submit Harvest for Verification': 'submitForAiVerification',
    'View Harvest Zones': 'viewHarvestZones',
    'Route Bio-waste': 'routeBioWaste',
    'View Harvest History': 'viewHarvestHistory',
    'Upload Test Results': 'uploadTestResults',
    'View Assigned Batches': 'viewAssignedBatches',
    'Scan Raw Material': 'scanRawMaterial',
    'View Inventory': 'viewInventory',
    'Scan Product QR Code': 'scanProduct',
    'View Product Journey': 'productJourney',
    'Approve Registrations': 'approveRegistrations',
    'Monitor Supply Chain': 'monitorSupplyChain',
    'Access Herb Database': 'accessHerbDatabase',
  };
  
  const totalResults = searchResults ? searchResults.users.length + searchResults.batches.length + searchResults.products.length : 0;

  return (
    <>
      <div className="w-full max-w-sm mx-auto flex flex-col h-[600px] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-green-700 text-white sticky top-0">
              <button onClick={handleLogout} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-all transform active:scale-95">
                  <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{t(user.role.toLowerCase())} {t('dashboard')}</h1>
                <Tooltip content={isExplanationLoading ? <Spinner size="h-4 w-4"/> : roleExplanation}>
                    <button type="button" aria-label="Role information" className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1">
                        <InfoIcon className="h-5 w-5 text-white/70" />
                    </button>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggleButton className="focus:ring-white/50 focus:ring-offset-green-700" />
                <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-green-700 transition-all transform active:scale-95">
                    <CogIcon className="h-6 w-6" />
                </button>
              </div>
          </header>

          <div className="p-6 flex-grow overflow-y-auto">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300">{welcomeMessage}</h2>
                {(user.role === UserRole.Farmer || user.role === UserRole.Factory) && (user.rewardPoints ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded-full animate-fade-in-fast">
                        <AwardIcon className="h-4 w-4" />
                        <span>{user.rewardPoints} {t('points')}</span>
                    </div>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-400 mb-4">{t('selectAction')}</p>

              <div className="mb-6">
                <SearchBar onSearch={handleSearch} isLoading={isSearchLoading} />
              </div>
              
              <div className="space-y-4">
                  {actions.length > 0 ? (
                      actions.map(action => {
                        const translationKey = actionNameKeyMap[action.name] || action.name;
                        const Icon = action.icon;
                        return (
                          <Button
                              key={action.path}
                              variant="secondary"
                              onClick={() => navigate(action.path)}
                              disabled={!action.implemented}
                              className={`flex items-center justify-center gap-3 ${!action.implemented ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                              {Icon && <Icon className="h-5 w-5" />}
                              <span>{t(translationKey)} {!action.implemented && `(${t('comingSoon')})`}</span>
                          </Button>
                        )
                      })
                  ) : (
                      <p className="text-center text-gray-800 dark:text-gray-400">No actions available for this role.</p>
                  )}
              </div>
          </div>

          <footer className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleLogout} className="font-semibold text-red-600 hover:underline">
                  {t('logout')}
              </button>
          </footer>
      </div>

      <Modal isOpen={isResultsModalOpen} onClose={closeSearchModal} title={t('searchResultsFor', { query: searchQuery })}>
        <div className="max-h-[400px] overflow-y-auto pr-2">
            {isSearchLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Spinner size="h-8 w-8" />
                </div>
            ) : searchResults && totalResults > 0 ? (
                <div className="space-y-6">
                    {/* Products Section */}
                    {searchResults.products.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-gray-600">{t('products')}</h3>
                            <ul className="space-y-2">
                                {searchResults.products.map((product: Product) => (
                                    <li key={product.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                                        <PackageIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-400 font-mono">{product.id}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {/* Batches Section */}
                    {searchResults.batches.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-gray-600">{t('batches')}</h3>
                             <ul className="space-y-2">
                                {searchResults.batches.map((batch: Batch) => (
                                    <li key={batch.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                                        <BeakerIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{batch.herbSpecies}</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-400 font-mono">{batch.id} - <span className="italic">{batch.status}</span></p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* Users Section */}
                    {searchResults.users.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-gray-600">{t('users')}</h3>
                            <ul className="space-y-2">
                                {searchResults.users.map((u: User) => {
                                    const Icon = roleIcons[u.role] || UserIcon;
                                    return (
                                        <li key={u.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{u.name}</p>
                                                <p className="text-xs text-gray-800 dark:text-gray-400">{t(u.role.toLowerCase())} - {u.id}</p>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-800 dark:text-gray-400">{t('noResultsFound')}</p>
                </div>
            )}
        </div>
      </Modal>
    </>
  );
};

export default RoleSelectionScreen;