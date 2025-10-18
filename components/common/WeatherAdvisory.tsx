import React from 'react';
import { useTranslation } from '../../App';
import { WeatherAdvisory as WeatherAdvisoryType } from '../../types';
import Spinner from './Spinner';
import AIIcon from '../icons/AIIcon';

interface WeatherAdvisoryProps {
  data: WeatherAdvisoryType | null;
  isLoading: boolean;
}

const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 bg-blue-50 dark:bg-gray-700/50 border border-blue-200 dark:border-blue-800 rounded-xl">
      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-200 mb-2">{t('weatherAdvisory')}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Spinner className="text-blue-600" />
        </div>
      ) : data ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {data.forecast.map((day) => (
              <div key={day.day} className="p-2 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-300">{day.day}</p>
                <day.icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto my-1" />
                <p className="font-bold text-gray-900 dark:text-gray-100">{day.temp}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{day.precip} precip.</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
            <div className="flex items-start gap-2">
                <AIIcon className="h-5 w-5 text-blue-700 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200">{t('aiHarvestSummary')}</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-300">{data.aiSummary}</p>
                </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WeatherAdvisory;