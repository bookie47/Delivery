export const onAuthStateChanged = jest.fn(() => {
  return Promise.resolve({
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  });
});

export const signInWithEmailAndPassword = jest.fn(() => {
  return Promise.resolve({
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  });
});

export const signOut = jest.fn(() => {
  return Promise.resolve();
});

export const getReactNativePersistence = jest.fn(() => ({}));
export const initializeAuth = jest.fn(() => ({}));
