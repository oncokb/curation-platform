import axios from 'axios';
import sinon from 'sinon';
import * as reactJhipster from 'react-jhipster';
import { AUTH_TOKEN_KEY, AuthStore, createStores } from 'app/shared/stores';
import * as mobx from 'mobx';
import { toJS } from 'mobx';
import * as _ from 'lodash';
import { stubMethod } from '../../utils';
jest.mock('react-jhipster');
const { session: sessionStorage, local: localStorage } = reactJhipster.Storage;
const sessionStorageMock = sessionStorage as jest.Mocked<typeof sessionStorage>;
const localStorageMock = localStorage as jest.Mocked<typeof localStorage>;

describe('Authentication store tests', () => {
  const initialState = {
    account: {},
    idToken: null,
    isAuthenticated: false,
    loading: false,
    loginError: false,
    loginSuccess: false,
    logoutUrl: null,
    redirectMessage: null,
    rootStore: null,
    sessionHasBeenFetched: false,
    showModalLogin: false,
    updateSuccess: false,
    updating: false,
  };

  function isAccountEmpty(state): boolean {
    return Object.keys(state.account).length === 0;
  }

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new AuthStore(null);
      expect(toJS(store)).toMatchObject(initialState);
      expect(isAccountEmpty(toJS(store)));
    });

    it('should reset to the initial state', () => {
      const store = new AuthStore(null);
      expect(toJS(store)).toMatchObject(initialState);
      _.mapKeys(initialState, (value, key) => (store[key] = 'blabla'));
      expect(toJS(store)).toMatchObject(_.mapValues(initialState, () => 'blabla'));
      store.reset();
      (store as any).rootStore = null;
      (store as any).hasAnyAuthority = jasmine.anything();
      expect(toJS(store)).toMatchObject(initialState);
    });
  });

  describe('Success', () => {
    let store;
    const resolvedObject = {
      headers: {
        authorization: 'Bearer 12345',
      },
    };

    const resolvedSessionObject = {
      data: {
        activated: true,
      },
    };

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new AuthStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('should have success state and token stored in session on login', function* () {
      axios.post = sinon.stub().returns(Promise.resolve(resolvedObject));
      store.getSession = sinon.stub().returns(Promise.resolve());
      const login = yield store.loginGen('user', 'pass');
      expect(store.getSession.called).toEqual(true);
      expect(login).toEqual(resolvedObject);
      expect(sessionStorageMock.set).toBeCalledWith(AUTH_TOKEN_KEY, '12345');

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        loginSuccess: true,
        loginError: false,
        showModalLogin: false,
      });
    });

    it('should have success state and token stored locally on remember me login', function* () {
      axios.post = sinon.stub().returns(Promise.resolve(resolvedObject));
      store.getSession = sinon.stub().returns(Promise.resolve());
      const login = yield store.loginGen('user', 'pass', true);
      expect(store.getSession.called).toEqual(true);
      expect(login).toEqual(resolvedObject);
      expect(localStorageMock.set).toBeCalledWith(AUTH_TOKEN_KEY, '12345');

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        loginSuccess: true,
        loginError: false,
        showModalLogin: false,
      });
    });

    it('should have fail state and no token stored in session on login with no bearer in response', function* () {
      const emptyResponse = { headers: {} };
      axios.post = sinon.stub().returns(Promise.resolve(emptyResponse));
      store.getSession = sinon.stub().returns(Promise.resolve());
      const login = yield store.loginGen('user', 'pass');
      expect(store.getSession.called).toEqual(true);
      expect(login).toEqual(emptyResponse);
      expect(sessionStorageMock.set).not.toBeCalled();

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        loginSuccess: true,
        loginError: false,
        showModalLogin: false,
      });
    });

    function* assertActionsCalled(actions: string[], extracted: () => Generator<any, any, any>) {
      const events = [];
      const dispose = mobx.spy(e => events.push(e));

      yield* extracted();

      expect(events.filter(e => e.type === 'action').map(e => e.name)).toEqual(actions);
      dispose();
    }

    it('should set error state on login exception', function* () {
      axios.post = sinon.stub().rejects(new Error('loginPostError'));

      yield* assertActionsCalled(['reset'], function* () {
        try {
          yield store.loginGen('user', 'pass');
          fail('should not reach this line');
        } catch (e) {
          expect(e.message).toEqual('loginPostError');
        }
      });

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        loginError: true,
        showModalLogin: true,
        errorMessage: 'loginPostError',
      });
    });

    it('should have success state and lang stored locally on get session', function* () {
      const resolvedSessionObjectWithLang = {
        data: {
          ...resolvedSessionObject.data,
          langKey: 'en',
        },
      };

      axios.get = sinon.stub().returns(Promise.resolve(resolvedSessionObjectWithLang));
      const session = yield* store.getSessionGen();
      expect(session).toEqual(resolvedSessionObjectWithLang);

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        sessionHasBeenFetched: true,
        isAuthenticated: true,
        account: resolvedSessionObjectWithLang.data,
      });
    });

    it('should have success state and leave locale unchanged on get session', function* () {
      axios.get = sinon.stub().returns(Promise.resolve(resolvedSessionObject));
      const session = yield store.getSessionGen();
      expect(session).toEqual(resolvedSessionObject);

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        sessionHasBeenFetched: true,
        isAuthenticated: true,
        account: resolvedSessionObject.data,
      });
    });

    it('should set error state on get session exception', function* () {
      axios.get = sinon.stub().rejects(new Error('sessionGetError'));
      store.reset = sinon.stub();
      try {
        const login = yield store.getSessionGen();
        fail('should not reach this line');
      } catch (e) {
        expect(e.message).toEqual('sessionGetError');
      }

      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        isAuthenticated: false,
        sessionHasBeenFetched: true,
        showModalLogin: true,
        errorMessage: 'sessionGetError',
      });
    });

    it('should show modal with message on displayAuthError', function () {
      store.displayAuthError('authErrorMsg');
      expect(
        toJS({
          ...store,
          rootStore: null,
        })
      ).toMatchObject({
        ...initialState,
        redirectMessage: 'authErrorMsg',
        showModalLogin: true,
      });
    });

    describe('clearAuthToken', () => {
      it('should reset authentication state on clearAuthentication', function () {
        stubMethod(store, 'clearAuthToken');
        stubMethod(store, 'displayAuthError');
        store.clearAuthentication();
        expect(store.clearAuthToken).toBeCalled();
        expect(store.displayAuthError).toBeCalled();
        expect(
          toJS({
            ...store,
            rootStore: null,
          })
        ).toMatchObject({
          ...initialState,
          loading: false,
          showModalLogin: true,
          isAuthenticated: false,
        });
      });

      it('should clear and reset on logout', function () {
        store.reset = sinon.stub();
        stubMethod(store, 'clearAuthToken');
        stubMethod(store, 'reset');
        store.logout();
        expect(store.clearAuthToken).toBeCalled();
        expect(store.reset).toBeCalled();
        expect(
          toJS({
            ...store,
            rootStore: null,
          })
        ).toMatchObject({
          ...initialState,
          showModalLogin: true,
        });
      });

      it('should remove authentication token values on clearAuthToken', function () {
        localStorageMock.get.mockReturnValueOnce('localValue');
        sessionStorageMock.get.mockReturnValueOnce('sessionValue');
        store.clearAuthToken();
        expect(localStorageMock.get).toBeCalledWith(AUTH_TOKEN_KEY);
        expect(sessionStorageMock.get).toBeCalledWith(AUTH_TOKEN_KEY);
        expect(localStorageMock.remove).toBeCalledWith(AUTH_TOKEN_KEY);
        expect(sessionStorageMock.remove).toBeCalledWith(AUTH_TOKEN_KEY);
      });
    });
  });
});
