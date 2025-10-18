import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../App';
import { searchHerbs } from '../../services/herbDatabaseService';
import { MedicinalHerb } from '../../types';
import Spinner from '../common/Spinner';
import Input from '../common/Input';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import SearchIcon from '../icons/SearchIcon';

const HerbDatabaseScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [herbs, setHerbs] = useState<MedicinalHerb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
        const results = await searchHerbs(searchQuery);
        setHerbs(results);
    } catch (error) {
        console.error("Failed to search herbs:", error);
        setHerbs([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(''); // Initial load
  }, [performSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
        performSearch(query);
    }, 300); // Debounce search
    return () => clearTimeout(handler);
  }, [query, performSearch]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0 z-10">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('herbDatabase')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="p-4">
        <Input 
          icon={<SearchIcon className="w-5 h-5" />}
          type="search"
          placeholder={t('searchHerbsPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="!bg-white dark:!bg-gray-800"
        />
      </div>

      <div className="flex-grow p-4 pt-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="h-8 w-8" />
          </div>
        ) : herbs.length > 0 ? (
          <ul className="space-y-4">
            {herbs.map(herb => (
              <li key={herb.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-fade-in-fast">
                <div className="flex items-start gap-4">
                  <img
                    src={herb.imageUrl}
                    alt={herb.name}
                    className="h-16 w-16 object-cover rounded-lg flex-shrink-0 bg-gray-200 dark:bg-gray-700"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{herb.name}</h3>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">{herb.scientificName}</p>
                  </div>
                </div>
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-300">{t('medicinalUses')}:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-400 mt-1 space-y-1">
                        {herb.uses.map(use => <li key={use}>{use}</li>)}
                    </ul>
                </div>
                <div className="mt-3 text-xs text-center">
                    <a href={herb.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 dark:text-green-400 hover:underline">
                        {t('source')}: {herb.source}
                    </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p>{t('noHerbsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HerbDatabaseScreen;