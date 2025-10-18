import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Spinner from '../common/Spinner';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import MapPinIcon from '../icons/MapPinIcon';
import UploadIcon from '../icons/UploadIcon';
import { verifyHarvestSubmission, verifyHarvestImage } from '../../services/aiService';
import { getWeatherAdvisory } from '../../services/weatherService';
import { useAppState, useTranslation } from '../../App';
import { validateRequired, validateNumber } from '../../utils/validation';
import { WeatherAdvisory as WeatherAdvisoryType } from '../../types';
import WeatherAdvisory from '../common/WeatherAdvisory';

const FarmerDashboard: React.FC = () => {
  const [batchId, setBatchId] = useState('');
  const [herbSpecies, setHerbSpecies] = useState('');
  const [weight, setWeight] = useState('');
  const [harvestSeason, setHarvestSeason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const [geoLocation, setGeoLocation] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [harvestImage, setHarvestImage] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherAdvisoryType | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setVerificationResult } = useAppState();
  const { t } = useTranslation();

  const validateForm = useCallback(() => {
      const newErrors: { [key: string]: string } = {};
      
      const batchIdError = validateRequired(batchId);
      if (batchIdError) newErrors.batchId = t(batchIdError, { fieldName: t('batchId')});

      const herbSpeciesError = validateRequired(herbSpecies);
      if (herbSpeciesError) newErrors.herbSpecies = t(herbSpeciesError, { fieldName: t('herbSpecies')});

      const weightError = validateRequired(weight) || validateNumber(weight);
      if (weightError) newErrors.weight = t(weightError, { fieldName: t('weightKg')});
      
      const harvestSeasonError = validateRequired(harvestSeason);
      if (harvestSeasonError) newErrors.harvestSeason = t(harvestSeasonError, { fieldName: t('seasonOfHarvest')});

      if (!geoLocation && !harvestImage) {
        newErrors.locationOrImage = t('errorLocationOrImage');
      }
      
      setErrors(newErrors);
      const formIsValid = Object.keys(newErrors).length === 0;
      setIsFormValid(formIsValid);
      return formIsValid;
  }, [batchId, herbSpecies, weight, harvestSeason, geoLocation, harvestImage, t]);

  useEffect(() => {
      validateForm();
  }, [batchId, herbSpecies, weight, harvestSeason, geoLocation, harvestImage, validateForm]);

  const fetchWeather = async (location: string) => {
    setIsFetchingWeather(true);
    try {
      const data = await getWeatherAdvisory(location);
      setWeatherData(data);
    } catch (error) {
      console.error("Failed to fetch weather data", error);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleGetLocation = (isAuto: boolean = false) => {
    setIsFetchingLocation(true);
    setLocationError('');
    if (!isAuto) {
      setTouched(prev => ({ ...prev, locationOrImage: true }));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setGeoLocation(locationString);
        setIsFetchingLocation(false);
        setHarvestImage(null);
        setImageFileName('');
        fetchWeather(locationString);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (!isAuto) {
          setLocationError(t('errorGettingLocation', { message: error.message }));
        }
        setIsFetchingLocation(false);
      }
    );
  };
  
  // Attempt to fetch location on component mount for better UX
  useEffect(() => {
    handleGetLocation(true);
  }, []); // Empty array ensures this runs only once on mount.


  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setHarvestImage(file);
    setImageFileName(file ? file.name : '');
    setTouched(prev => ({ ...prev, locationOrImage: true }));
    if (file) {
      setGeoLocation('');
      setLocationError('');
      setWeatherData(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ batchId: true, herbSpecies: true, weight: true, harvestSeason: true, locationOrImage: true });
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
        const weightNum = parseFloat(weight);
        let result;

        if (harvestImage) {
          result = await verifyHarvestImage({
            file: harvestImage,
            batchId, herbSpecies, weight: weightNum, harvestSeason
          });
        } else {
          result = await verifyHarvestSubmission({
            batchId, herbSpecies, weight: weightNum, geoLocation, harvestSeason
          });
        }
        
        setVerificationResult(result);
        navigate('/verification');
    } catch (err: any) {
        setErrors({ form: err.message || 'Failed to submit for verification. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('submitHarvest')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow p-6 overflow-y-auto">
        {(weatherData || isFetchingWeather) && (
            <div className="mb-4">
                <WeatherAdvisory data={weatherData} isLoading={isFetchingWeather} />
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('batchId')}</label>
            <Input 
              name="batchId" type="text" placeholder="e.g., 123456" 
              value={batchId} onChange={(e) => setBatchId(e.target.value)} onBlur={handleBlur}
              isInvalid={touched.batchId && !!errors.batchId}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
            {touched.batchId && errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('herbSpecies')}</label>
            <Input 
              name="herbSpecies" type="text" placeholder="e.g., Tulsi"
              value={herbSpecies} onChange={(e) => setHerbSpecies(e.target.value)} onBlur={handleBlur}
              isInvalid={touched.herbSpecies && !!errors.herbSpecies}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
             {touched.herbSpecies && errors.herbSpecies && <p className="text-red-500 text-xs mt-1">{errors.herbSpecies}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('weightKg')}</label>
            <Input 
              name="weight" type="number" placeholder="e.g., 50"
              value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={handleBlur}
              isInvalid={touched.weight && !!errors.weight}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
            {touched.weight && errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>

          <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 space-y-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">{t('geoLocation')}</label>
            {!geoLocation && (
              <Button type="button" variant="outline" onClick={() => handleGetLocation(false)} disabled={isFetchingLocation} className="!border-green-600 !text-green-700 hover:!bg-green-600 hover:!text-white dark:!border-green-400 dark:!text-green-300 dark:hover:!bg-green-400 dark:hover:!text-gray-900">
                <div className="flex items-center justify-center gap-2">
                  {isFetchingLocation ? <Spinner size="h-4 w-4" /> : <MapPinIcon className="h-5 w-5" />}
                  <span>{isFetchingLocation ? t('fetching') : t('getCurrentLocation')}</span>
                </div>
              </Button>
            )}
            {geoLocation && (
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700 dark:text-gray-400" />
                <input type="text" value={geoLocation} readOnly className="w-full py-3 pl-10 pr-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl focus:outline-none" />
              </div>
            )}
             {locationError && (
                <div className="text-center">
                    <p className="text-red-500 text-xs mb-2">{locationError}</p>
                </div>
            )}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">OR</div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="!border-gray-400 !text-gray-600 hover:!bg-gray-600 hover:!text-white dark:!border-gray-500 dark:!text-gray-400 dark:hover:!bg-gray-500 dark:hover:!text-white">
                 <div className="flex items-center justify-center gap-2">
                    <UploadIcon className="h-5 w-5" />
                    <span className="truncate">{imageFileName || t('uploadHarvestImage')}</span>
                </div>
            </Button>
             {touched.locationOrImage && errors.locationOrImage && <p className="text-red-500 text-xs mt-1 text-center">{errors.locationOrImage}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('seasonOfHarvest')}</label>
            <Input 
              name="harvestSeason" type="text" placeholder="e.g., Monsoon"
              value={harvestSeason} onChange={(e) => setHarvestSeason(e.target.value)} onBlur={handleBlur}
              isInvalid={touched.harvestSeason && !!errors.harvestSeason}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
            {touched.harvestSeason && errors.harvestSeason && <p className="text-red-500 text-xs mt-1">{errors.harvestSeason}</p>}
          </div>

          {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}

          <div className="pt-4">
            <Button variant="secondary" type="submit" disabled={isLoading || !isFormValid}>
              {isLoading ? <Spinner /> : t('submitForAiVerification')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerDashboard;