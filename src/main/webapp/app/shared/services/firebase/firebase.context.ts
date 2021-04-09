import { createContext, useContext } from 'react';
import Firebase from './firebase';

export const FirebaseContext = createContext<Firebase>(null);
export const FirebaseProvider = FirebaseContext.Provider;
export const useFirebase = () => {
  return useContext<Firebase>(FirebaseContext);
};
