import { UserRole } from '../types';

interface RegistrationRequestDetails {
    name: string;
    userId: string;
    role: UserRole;
}

interface RegistrationDecisionDetails {
    name: string;
    userId: string;
    role: UserRole;
    decision: 'approved' | 'rejected';
}

const ADMIN_EMAIL = 'mystrixion2025@gmail.com'; // Corrected typo from "gamil.com"

/**
 * Simulates sending an email notification for a new user registration request.
 * @param details - The details of the registration request.
 */
export const sendRegistrationRequestEmail = async (details: RegistrationRequestDetails): Promise<void> => {
    const { name, userId, role } = details;
    const subject = `New User Registration Request: ${name} (${role})`;
    const body = `
        A new user has registered and is awaiting approval.

        Details:
        - Name: ${name}
        - User ID: ${userId}
        - Requested Role: ${role}

        Please log in to the Admin Dashboard to review and approve/reject this request.
    `;

    console.log("--- SIMULATING EMAIL ---");
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(body.trim());
    console.log("----------------------");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Simulates sending an email notification about an admin's decision on a registration.
 * @param details - The details of the registration decision.
 */
export const sendRegistrationDecisionEmail = async (details: RegistrationDecisionDetails): Promise<void> => {
    const { name, userId, role, decision } = details;
    const subject = `Registration Request for ${name} has been ${decision.charAt(0).toUpperCase() + decision.slice(1)}`;
    const body = `
        The registration request for the following user has been processed:

        Details:
        - Name: ${name}
        - User ID: ${userId}
        - Requested Role: ${role}
        - Status: ${decision.toUpperCase()}

        This is an automated notification.
    `;

    console.log("--- SIMULATING EMAIL ---");
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(body.trim());
    console.log("----------------------");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
};
