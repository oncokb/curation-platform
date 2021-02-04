import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import { toJS } from 'mobx';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';
import PasswordResetStore from 'app/modules/account/password-reset/password-reset.store';
import * as reactJhipster from 'react-jhipster';

jest.mock('axios');
jest.mock('react-jhipster');
const axiosMock = axios as jest.Mocked<typeof axios>;
const reactJhipsterMock = reactJhipster as jest.Mocked<typeof reactJhipster>;

describe('PasswordReset store tests', () => {
  const initialState = {
    activationSuccess: false,
    activationFailure: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new PasswordResetStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use operationHandler and have messages', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      reactJhipsterMock.translate.mockReturnValueOnce('finish');
      reactJhipsterMock.translate.mockReturnValueOnce('request');
      reactJhipsterMock.translate.mockReturnValueOnce('notfound');

      const store = new PasswordResetStore(null);
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.handlePasswordResetFinishGen, expect.any(Function));
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.handlePasswordResetInitGen, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new PasswordResetStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('should reset state to initial', () => {
      store.activationSuccess = true;
      store.activationFailure = true;
      store.reset();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('handlePasswordResetInitGen should set activationSuccess and return response', function* () {
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const result = yield store.handlePasswordResetInitGen('a@b.cd');
      expect(axiosMock.post).toBeCalledWith('/api/account/reset-password/init', 'a@b.cd', { headers: { 'Content-Type': 'text/plain' } });
      expect(result).toBe(axiosResponse);
      expect(store.activationSuccess).toBe(true);
    });

    it('handlePasswordResetInitGen should set activationFailure and return response', function* () {
      const axiosRejection = {};
      axiosMock.post.mockRejectedValueOnce(axiosRejection);
      try {
        yield store.handlePasswordResetInitGen('a@b.cd');
        fail('should not reach this line because of an error');
      } catch (e) {
        expect(e).toBe(axiosRejection);
      }
      expect(axiosMock.post).toBeCalledWith('/api/account/reset-password/init', 'a@b.cd', { headers: { 'Content-Type': 'text/plain' } });
      expect(store.activationFailure).toBe(true);
    });

    it('handlePasswordResetFinishGen should set activationSuccess and return response', function* () {
      const key = 'a1',
        newPassword = 'pass';
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const result = yield store.handlePasswordResetFinishGen(key, newPassword);
      expect(axiosMock.post).toBeCalledWith('/api/account/reset-password/finish', { key, newPassword });
      expect(result).toBe(axiosResponse);
      expect(store.activationSuccess).toBe(true);
    });

    it('handlePasswordResetFinishGen should set activationFailure and return response', function* () {
      const key = 'a1',
        newPassword = 'pass';
      const axiosRejection = {};
      axiosMock.post.mockRejectedValueOnce(axiosRejection);
      try {
        yield store.handlePasswordResetFinishGen(key, newPassword);
        fail('should not reach this line because of an error');
      } catch (e) {
        expect(e).toBe(axiosRejection);
      }
      expect(axiosMock.post).toBeCalledWith('/api/account/reset-password/finish', { key, newPassword });
      expect(store.activationFailure).toBe(true);
    });
  });
});
