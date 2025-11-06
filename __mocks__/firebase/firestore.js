export const doc = jest.fn(() => ({}));
export const getDoc = jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ name: 'Test User', email: 'test@example.com' }) }));
export const collection = jest.fn(() => ({}));
export const query = jest.fn(() => ({}));
export const where = jest.fn(() => ({}));
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const setDoc = jest.fn(() => Promise.resolve());
export const getFirestore = jest.fn(() => ({}));
