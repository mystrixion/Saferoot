import { WeatherAdvisory } from '../types';
import SunIcon from '../components/icons/SunIcon';
import SunCloudIcon from '../components/icons/SunCloudIcon';
import RainIcon from '../components/icons/RainIcon';

export const getWeatherAdvisory = async (location: string): Promise<WeatherAdvisory> => {
    console.log(`Fetching weather for: ${location}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call

    // Mock response based on a simple hash of the location string to get some variation
    const locationHash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isRainy = locationHash % 3 === 0;

    const advisory: WeatherAdvisory = {
        location: 'Bengaluru, India', // Mock a resolved location name
        forecast: [
            { day: 'Today', icon: isRainy ? RainIcon : SunCloudIcon, temp: isRainy ? '26°C' : '31°C', precip: isRainy ? '70%' : '20%' },
            { day: 'Tomorrow', icon: SunCloudIcon, temp: '32°C', precip: '30%' },
            { day: 'Day After', icon: SunIcon, temp: '33°C', precip: '10%' },
        ],
        aiSummary: isRainy 
            ? "High chance of rain today. Recommend postponing harvest. Good conditions for indoor sorting. Upcoming days look clearer, ideal for drying."
            : "Good weather for harvesting today with low chance of rain. The next two days are clear and hot, perfect for post-harvest drying."
    };

    return advisory;
};