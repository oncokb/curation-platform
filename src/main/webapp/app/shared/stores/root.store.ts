import AppStore from './app.store';
import AuthenticationStore from './authentication.store';
import RouterStore from './router.store';
import WindowStore from './window.store';
import { History } from 'history';
import Firebase from '../services/firebase';
import UsersStore from './users.store';

export default class RootStore {
  authenticationStore: AuthenticationStore;
  appStore: AppStore;
  windowStore: WindowStore;
  routerStore: RouterStore;
  usersStore: UsersStore;

  constructor(history: History, firebase: Firebase) {
    this.authenticationStore = new AuthenticationStore(this, firebase);
    this.appStore = new AppStore(this);
    this.windowStore = new WindowStore(this);
    this.routerStore = new RouterStore(history);
    this.usersStore = new UsersStore(this, firebase);
  }
}

export const createStores = (history: History, firebase: Firebase) => {
  return new RootStore(history, firebase);
};
