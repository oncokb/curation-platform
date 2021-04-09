import { createContext, useContext } from 'react';
import RootStore from './root.store';

export const StoresContext = createContext<RootStore>(null);
export const StoresProvider = StoresContext.Provider;
export const useStores = () => {
  return useContext<RootStore>(StoresContext);
};
