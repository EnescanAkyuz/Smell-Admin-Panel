import { SETTINGS } from '../config/settings';

// In a real app, this would be an axios instance
// const api = axios.create({ baseURL: SETTINGS.API_URL });

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${SETTINGS.API_URL}${endpoint}`;

    // For now, this is just a structure. Underneath, you'd use fetch or axios.
    // To make this template work immediately with dummy data, 
    // we could add a toggle for "MOCK_MODE" in settings.

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

/**
 * A helper to simulate API delay for the mock environment
 */
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
