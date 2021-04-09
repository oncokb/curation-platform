import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import { IUser } from '../model/user.model';
import Firebase from '../services/firebase';
import { notifyError } from '../util/notification.util';
import RootStore from './root.store';

export default class AuthenticationStore {
  private readonly rootStore: RootStore;
  private readonly firebase: Firebase;

  loading = false;
  loginSuccess = false;
  loginError = false;
  showModalLogin = false;
  errorMessage = ''; // Errors returned from server side
  account: IUser | undefined;
  isAuthenticated = false;
  logoutUrl = '';
  idToken = '';

  constructor(rootStore: RootStore, firebase: Firebase) {
    this.rootStore = rootStore;
    this.firebase = firebase;
    firebase.auth.onAuthStateChanged((authUser: any) => {
      if (authUser) {
        const signInUser = {
          name: authUser.displayName,
          email: authUser.email,
          photoURL: authUser.photoURL,
          key: authUser.email.replace(/\./g, ''),
          role: undefined,
        };
        this.firebase
          .getUser(signInUser.key)
          .then(user => {
            if (!_.isUndefined(user.role)) {
              signInUser.role = user.role;
            }
            this.loginSuccessfully(signInUser);
          })
          .catch(() => {
            notifyError(new Error('You do not have access to login. Please contact the OncoKB team.'));
            this.loginFailed();
          });
      }
    });
    makeAutoObservable(this);
  }

  get userName() {
    return this.account.name;
  }

  get userRole() {
    return this.account.role;
  }

  login = () => {
    this.loading = true;
    this.firebase.doSignInWithGoogle();
  };

  loginSuccessfully = (authUser: any) => {
    this.isAuthenticated = true;
    this.account = {
      name: authUser.name,
      email: authUser.email,
      photoURL: authUser.photoURL,
      key: authUser.key,
      role: authUser.role,
    };
    this.loading = false;
    this.loginSuccess = true;
  };

  loginFailed = () => {
    this.loginSuccess = false;
    this.loading = false;
    this.loginError = true;
    this.logout();
  };

  reset = () => {
    this.account = undefined;
    this.isAuthenticated = false;
    this.loading = false;
    this.loginSuccess = false;
    this.loginError = false;
    this.showModalLogin = false;
    this.errorMessage = ''; // Errors returned from server side
  };

  logout = () => {
    this.firebase.doSignOut();
    this.reset();
  };
}
