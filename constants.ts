import { UserRole, RoleAction } from './types';
import HarvestIcon from './components/icons/HarvestIcon';
import MapPinIcon from './components/icons/MapPinIcon';
import TruckIcon from './components/icons/TruckIcon';
import HistoryIcon from './components/icons/HistoryIcon';
import UploadIcon from './components/icons/UploadIcon';
import BeakerIcon from './components/icons/BeakerIcon';
import FactoryIcon from './components/icons/FactoryIcon';
import PackageIcon from './components/icons/PackageIcon';
import QrCodeIcon from './components/icons/QrCodeIcon';
import RouteIcon from './components/icons/RouteIcon';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import MonitorIcon from './components/icons/MonitorIcon';
import BookOpenIcon from './components/icons/BookOpenIcon';


export const ROLE_ACTIONS: Record<UserRole, RoleAction[]> = {
  [UserRole.Farmer]: [
    { name: 'Submit Harvest for Verification', path: '/dashboard/farmer', implemented: true, icon: HarvestIcon },
    { name: 'View Harvest Zones', path: '/harvest-map', implemented: true, icon: MapPinIcon },
    { name: 'Access Herb Database', path: '/herb-database', implemented: true, icon: BookOpenIcon },
    { name: 'Route Bio-waste', path: '/biowaste/route', implemented: true, icon: TruckIcon },
    { name: 'View Harvest History', path: '/history/farmer', implemented: false, icon: HistoryIcon },
  ],
  [UserRole.Lab]: [
    { name: 'Upload Test Results', path: '/dashboard/lab', implemented: true, icon: UploadIcon },
    { name: 'View Assigned Batches', path: '/batches/lab', implemented: false, icon: BeakerIcon },
  ],
  [UserRole.Factory]: [
    { name: 'Scan Raw Material', path: '/dashboard/factory', implemented: true, icon: FactoryIcon },
    { name: 'Route Bio-waste', path: '/biowaste/route', implemented: true, icon: TruckIcon },
    { name: 'View Inventory', path: '/inventory/factory', implemented: false, icon: PackageIcon },
  ],
  [UserRole.Customer]: [
    { name: 'Scan Product QR Code', path: '/dashboard/customer', implemented: true, icon: QrCodeIcon },
    { name: 'View Product Journey', path: '/journey/customer', implemented: true, icon: RouteIcon },
  ],
  [UserRole.Admin]: [
    { name: 'Approve Registrations', path: '/dashboard/admin', implemented: true, icon: CheckCircleIcon },
    { name: 'Monitor Supply Chain', path: '/monitor/admin', implemented: false, icon: MonitorIcon },
  ],
  [UserRole.AI]: [], // AI is not a user-facing role
};