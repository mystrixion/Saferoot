import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../App';
import { HarvestZone, ZoneType, ZoneStatus } from '../../types';
import Spinner from '../common/Spinner';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';

// Mock data for harvest zones within a simulated coordinate system
const MOCK_HARVEST_ZONES: HarvestZone[] = [
  {
    id: 'zone-a',
    name: 'North Forest Reserve',
    boundaries: { top: '10%', left: '15%', width: '30%', height: '25%', borderRadius: '10px' },
    allowedHerbs: ['Tulsi', 'Mint', 'Lemon Grass'],
    zoneType: ZoneType.Harvest,
    soilType: 'Loamy Clay',
    lastInspection: '2024-07-01',
    status: ZoneStatus.Active,
  },
  {
    id: 'zone-b',
    name: 'Green Valley Creek',
    boundaries: { top: '50%', left: '55%', width: '35%', height: '20%', borderRadius: '15px' },
    allowedHerbs: ['Ashwagandha', 'Brahmi'],
    zoneType: ZoneType.Harvest,
    soilType: 'Alluvial',
    lastInspection: '2024-06-25',
    status: ZoneStatus.Active,
  },
  {
    id: 'zone-c',
    name: 'Western Meadow',
    boundaries: { top: '75%', left: '10%', width: '25%', height: '15%', borderRadius: '50% 20% / 10% 40%'},
    allowedHerbs: ['Turmeric', 'Ginger'],
    zoneType: ZoneType.Harvest,
    soilType: 'Sandy Loam',
    lastInspection: '2024-05-15',
    status: ZoneStatus.Fallow,
  },
  {
    id: 'zone-d',
    name: 'Govt. Permitted Forest Area',
    boundaries: { top: '5%', left: '50%', width: '45%', height: '30%'},
    allowedHerbs: ['Amla', 'Haritaki', 'Bibhitaki'],
    zoneType: ZoneType.Permitted,
    soilType: 'Red Soil',
    lastInspection: '2024-07-10',
    status: ZoneStatus.Active,
  },
];


// Simulated map boundaries (latitude, longitude)
const MAP_BOUNDS = {
  north: 12.99,
  south: 12.95,
  west: 77.58,
  east: 77.62,
};

const HarvestMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userPosition, setUserPosition] = useState<{ top: string; left: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<HarvestZone | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Convert real lat/lng to percentage-based position on our simulated map
        const latPercent = ((MAP_BOUNDS.north - latitude) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
        const lngPercent = ((longitude - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
        
        // Clamp values between 0 and 100 to stay within map bounds
        const top = Math.max(0, Math.min(100, latPercent));
        const left = Math.max(0, Math.min(100, lngPercent));
        
        setUserPosition({ top: `${top}%`, left: `${left}%` });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(t('locationError'));
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [t]);
  
  const getZoneStyles = (zone: HarvestZone): string => {
    const isSelected = selectedZone?.id === zone.id;
    const baseSelected = 'shadow-lg scale-105 z-10';
    const baseHover = 'hover:scale-102 hover:z-10';
    switch(zone.zoneType) {
        case ZoneType.Permitted:
            return isSelected 
                ? `bg-yellow-500/50 border-yellow-700 dark:border-yellow-300 ${baseSelected}` 
                : `bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 border-dashed ${baseHover}`;
        case ZoneType.Harvest:
        default:
            return isSelected 
                ? `bg-green-500/50 border-green-700 dark:border-green-300 ${baseSelected}` 
                : `bg-green-500/20 border-green-500/50 hover:bg-green-500/30 ${baseHover}`;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl shadow-2xl overflow-hidden">
      <header className="flex items-center p-4 bg-green-700 text-white sticky top-0 z-20">
        <button onClick={() => navigate('/select-role')} className="p-2 -ml-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto">{t('harvestZoneMap')}</h1>
        <div className="w-6"></div>
      </header>
      <div className="flex-grow flex flex-col relative">
        <div className="relative w-full h-full bg-green-50 dark:bg-gray-700 overflow-hidden">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30 dark:opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

          {MOCK_HARVEST_ZONES.map((zone) => (
            <div
              key={zone.id}
              className={`absolute border-2 transition-all duration-300 ease-in-out cursor-pointer ${getZoneStyles(zone)}`}
              style={zone.boundaries}
              onClick={() => setSelectedZone(zone)}
            />
          ))}

          {userPosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: userPosition.top, left: userPosition.left, zIndex: 10 }}
              title={t('yourLocation')}
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
              </span>
            </div>
          )}

          {(isLoadingLocation || locationError) && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex flex-col items-center justify-center text-center p-4 z-10">
              {isLoadingLocation ? (
                <>
                  <Spinner size="h-8 w-8" />
                  <p className="mt-4 font-semibold text-lg text-gray-900 dark:text-gray-200">{t('fetchingLocation')}</p>
                </>
              ) : (
                <p className="font-semibold text-lg text-red-500">{locationError}</p>
              )}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-20">
          {selectedZone ? (
             <div className="animate-fade-in-fast">
                <h3 className="font-bold text-gray-900 dark:text-gray-200">{selectedZone.name}</h3>
                <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-gray-800 dark:text-gray-400">
                  <p><span className="font-semibold">{t('status')}:</span> <span className={selectedZone.status === ZoneStatus.Active ? 'text-green-600 dark:text-green-400 font-bold' : 'text-yellow-600 dark:text-yellow-400 font-bold'}>{t(selectedZone.status.toLowerCase())}</span></p>
                  <p><span className="font-semibold">{t('soilType')}:</span> {selectedZone.soilType}</p>
                  <p><span className="font-semibold">{t('lastInspection')}:</span> {selectedZone.lastInspection}</p>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-400 mt-2"><span className="font-semibold">{t('allowedHerbs')}:</span> {selectedZone.allowedHerbs.join(', ')}</p>
             </div>
          ) : (
            <div>
                 <h3 className="font-bold text-gray-900 dark:text-gray-200 text-sm mb-1">{t('mapLegend')}:</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-gray-800 dark:text-gray-400">{t('yourLocation')}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500/30 border border-green-500 rounded-sm"></div>
                        <span className="text-gray-800 dark:text-gray-400">{t('harvestZone')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-yellow-500/30 border border-yellow-500 border-dashed rounded-sm"></div>
                        <span className="text-gray-800 dark:text-gray-400">{t('permittedZone')}</span>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HarvestMapScreen;