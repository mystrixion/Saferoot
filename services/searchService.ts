import { User, UserRole, Batch, Product, SearchResults } from '../types';

// Mock data for searching
const MOCK_USERS: User[] = [
    { id: 'alicef', role: UserRole.Farmer, password: 'password', name: 'Alice Farmer' },
    { id: 'bobfact', role: UserRole.Factory, password: 'password', name: 'Bob Factory' },
    { id: 'charlief', role: UserRole.Farmer, password: 'password', name: 'Charlie Farmer' },
    { id: 'dianal', role: UserRole.Lab, password: 'password', name: 'Diana Lab' },
    { id: 'evanc', role: UserRole.Customer, password: 'password', name: 'Evan Customer' },
    { id: 'admin_user', role: UserRole.Admin, password: 'password', name: 'Admin Saferoot' },
];

const MOCK_BATCHES: Batch[] = [
    { id: 'FARM-451', herbSpecies: 'Tulsi (Holy Basil)', status: 'Processed' },
    { id: 'FARM-452', herbSpecies: 'Ashwagandha', status: 'Lab Tested' },
    { id: 'FARM-453', herbSpecies: 'Turmeric', status: 'Shipped' },
    { id: 'LAB-982', herbSpecies: 'Tulsi (Holy Basil)', status: 'Awaiting Processing' },
];

const MOCK_PRODUCTS: Product[] = [
    { id: 'SR-HERB-84321', name: 'Tulsi Extract 500mg', batchId: 'FARM-451' },
    { id: 'SR-HERB-84322', name: 'Ashwagandha Root Powder', batchId: 'FARM-452' },
    { id: 'SR-HERB-84323', name: 'Organic Turmeric Capsules', batchId: 'FARM-453' },
];

export const searchAll = async (query: string): Promise<SearchResults> => {
    console.log(`Searching for: "${query}"`);
    const lowerCaseQuery = query.toLowerCase();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 750));

    const users = MOCK_USERS.filter(user =>
        user.name?.toLowerCase().includes(lowerCaseQuery) ||
        user.id.toLowerCase().includes(lowerCaseQuery) ||
        user.role.toLowerCase().includes(lowerCaseQuery)
    );

    const batches = MOCK_BATCHES.filter(batch =>
        batch.id.toLowerCase().includes(lowerCaseQuery) ||
        batch.herbSpecies.toLowerCase().includes(lowerCaseQuery) ||
        batch.status.toLowerCase().includes(lowerCaseQuery)
    );

    const products = MOCK_PRODUCTS.filter(product =>
        product.id.toLowerCase().includes(lowerCaseQuery) ||
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.batchId.toLowerCase().includes(lowerCaseQuery)
    );
    
    const results = { users, batches, products };
    console.log("Search results:", results);
    return results;
};
