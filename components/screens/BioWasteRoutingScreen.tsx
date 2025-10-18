import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Spinner from '../common/Spinner';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import { useAppState, useTranslation } from '../../App';
import { BioWasteSubmission } from '../../types';
import { validateRequired, validateNumber } from '../../utils/validation';

const WASTE_TYPES = ['Plant Stems', 'Leaves', 'Processing Residue', 'Contaminated Soil', 'Other'];

const BioWasteRoutingScreen: React.FC = () => {
  const [wasteType, setWasteType] = useState(WASTE_TYPES[0]);
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [batchId, setBatchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();
  const { setBioWasteSubmission } = useAppState();
  const { t } = useTranslation();

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    const quantityError = validateRequired(quantity) || validateNumber(quantity);
    if (quantityError) newErrors.quantity = t(quantityError, { fieldName: t('quantityKg')});

    const locationError = validateRequired(location);
    if (locationError) newErrors.location = t(locationError, { fieldName: t('pickupLocation')});

    setErrors(newErrors);
    const formIsValid = Object.keys(newErrors).length === 0;
    setIsFormValid(formIsValid);
    return formIsValid;
  }, [quantity, location, t]);

  useEffect(() => {
    validateForm();
  }, [quantity, location, validateForm]);
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ quantity: true, location: true });
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    const submission: BioWasteSubmission = {
      type: wasteType,
      quantity: parseFloat(quantity),
      location,
      batchId,
    };

    // Simulate API call
    setTimeout(() => {
      setBioWasteSubmission(submission);
      setIsLoading(false);
      navigate('/biowaste/tracking');
    }, 1500);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('routeBioWaste')}</h1>
        <div className="w-6"></div>
      </header>

      <div className="flex-grow p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('wasteType')}</label>
            <Select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="!bg-gray-100 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !text-gray-900 dark:!text-gray-200"
            >
              {WASTE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('quantityKg')}</label>
            <Input
              name="quantity"
              type="number"
              placeholder="e.g., 100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={handleBlur}
              isInvalid={touched.quantity && !!errors.quantity}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
            {touched.quantity && errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('pickupLocation')}</label>
            <Input
              name="location"
              type="text"
              placeholder="e.g., Farm 12, West Field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onBlur={handleBlur}
              isInvalid={touched.location && !!errors.location}
              className="!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-200"
            />
            {touched.location && errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">{t('relatedBatchId')}</label>
            <Input
              type="text"
              placeholder="e.g., 123456"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="!bg-gray-100 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !text-gray-900 dark:!text-gray-200"
            />
          </div>
          
          <div className="pt-4">
            <Button variant="secondary" type="submit" disabled={isLoading || !isFormValid}>
              {isLoading ? <Spinner /> : t('findDisposalRoute')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BioWasteRoutingScreen;
