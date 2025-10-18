import React, { useState } from 'react';
import { useTranslation } from '../../App';
import SearchIcon from '../icons/SearchIcon';
import XIcon from '../icons/XIcon';
import Button from './Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-700 dark:text-gray-400" />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
        placeholder={t('searchPlaceholder')}
        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
      />
      {query && !isLoading && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-24 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all transform active:scale-95"
          aria-label="Clear search"
        >
          <XIcon className="h-5 w-5" />
        </button>
      )}
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading || !query.trim()}
        className="!absolute !right-2.5 !bottom-2.5 !w-auto !py-2"
      >
        {t('search')}
      </Button>
    </form>
  );
};

export default SearchBar;
