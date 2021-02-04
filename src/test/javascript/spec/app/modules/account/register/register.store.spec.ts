import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import { toJS } from 'mobx';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';
import RegisterStore from 'app/modules/account/register/register.store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Register store tests', () => {
  const initialState = {
    registrationSuccess: false,
    registrationFailure: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new RegisterStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new RegisterStore(null);
      expect(operationHandlerSpy).toHaveBeenLastCalledWith(store, store.handleRegisterGen, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new RegisterStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('should reset state to initial', () => {
      store.registrationSuccess = true;
      store.registrationFailure = true;
      store.reset();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('handleRegisterGen should set registrationSuccess and return response', function* () {
      const login = 'login',
        email = 'email',
        password = 'password',
        langKey = 'en';
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const result = yield store.handleRegisterGen(login, email, password, langKey);
      expect(axiosMock.post).toBeCalledWith('/api/register', { login, email, password, langKey });
      expect(result).toBe(axiosResponse);
      expect(store.registrationSuccess).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('handleRegisterGen should set registrationFailure and return response', function* () {
      const login = 'login',
        email = 'email',
        password = 'password';
      const axiosRejection = { response: { data: { errorKey: 'msgKey' } } };
      axiosMock.post.mockRejectedValueOnce(axiosRejection);
      try {
        yield store.handleRegisterGen(login, email, password);
        fail('should not reach this line because of an error');
      } catch (e) {
        expect(e).toBe(axiosRejection);
      }
      expect(axiosMock.post).toBeCalledWith('/api/register', { login, email, password, langKey: 'en' });
      expect(store.registrationFailure).toBe(true);
      expect(store.errorMessage).toBe('msgKey');
      expect(store.loading).toBe(false);
    });
  });
});
