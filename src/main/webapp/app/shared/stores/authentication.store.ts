import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { Storage } from 'react-jhipster';

export const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

export const hasAnyAuthority = (authorities: string[], hasAnyAuthorities: string[]) => {
  if (authorities && authorities.length !== 0) {
    if (hasAnyAuthorities.length === 0) {
      return true;
    }
    return hasAnyAuthorities.some(auth => authorities.includes(auth));
  }
  return false;
};

export class AuthStore extends BaseStore {
  @observable public isAuthenticated = false;
  @observable public account: any = {};
  @observable public redirectMessage: string = null;
  @observable public sessionHasBeenFetched = false;
  @observable public idToken: string = null;
  @observable public logoutUrl: string = null;
  @observable public loginSuccess = false;
  @observable public loginError = false; // Errors returned from server side
  @observable public showModalLogin = false;

  @action
  getSession = this.readHandler(this.getSessionGen);

  @action
  login = this.readHandler(this.loginGen);

  @action.bound
  reset = this.resetBase;

  resetBase() {
    this.isAuthenticated = false;
    this.account = {};
    this.redirectMessage = null;
    this.sessionHasBeenFetched = false;
    this.idToken = null;
    this.logoutUrl = null;
    this.loginSuccess = false;
    this.loginError = false; // Errors returned from server side
    this.showModalLogin = false;
    this.loading = false;
    this.errorMessage = null;
    this.updating = false;
    this.updateSuccess = false;
  }

  @action.bound
  displayAuthError(message) {
    this.showModalLogin = true;
    this.redirectMessage = message;
  }

  @action.bound
  clearAuthentication(messageKey) {
    this.clearAuthToken();
    this.displayAuthError(messageKey);

    this.loading = false;
    this.showModalLogin = true;
    this.isAuthenticated = false;
  }

  @action.bound
  clearAuthToken() {
    if (Storage.local.get(AUTH_TOKEN_KEY)) {
      Storage.local.remove(AUTH_TOKEN_KEY);
    }
    if (Storage.session.get(AUTH_TOKEN_KEY)) {
      Storage.session.remove(AUTH_TOKEN_KEY);
    }
  }

  @action.bound
  logout() {
    this.reset();
    this.clearAuthToken();
    this.showModalLogin = true;
  }

  *getSessionGen() {
    try {
      const result: AxiosResponse = yield axios.get('/api/account');
      this.account = result.data;
      this.isAuthenticated = result.data && result.data.activated;
      this.sessionHasBeenFetched = true;
      return result;
    } catch (e) {
      this.isAuthenticated = false;
      this.sessionHasBeenFetched = true;
      this.showModalLogin = true;
      this.errorMessage = e.message;
      throw e;
    }
  }

  *loginGen(username, password, rememberMe = false) {
    try {
      const result: AxiosResponse = yield axios.post('/api/authenticate', { username, password, rememberMe });
      const bearerToken = result.headers.authorization;
      if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
        const jwt = bearerToken.slice(7, bearerToken.length);
        if (rememberMe) {
          Storage.local.set(AUTH_TOKEN_KEY, jwt);
        } else {
          Storage.session.set(AUTH_TOKEN_KEY, jwt);
        }
      }
      yield this.getSession();
      this.loginError = false;
      this.showModalLogin = false;
      this.loginSuccess = true;
      return result;
    } catch (e) {
      this.reset();
      this.loginError = true;
      this.showModalLogin = true;
      this.errorMessage = e.message;
      throw e;
    }
  }
}

export default AuthStore;
