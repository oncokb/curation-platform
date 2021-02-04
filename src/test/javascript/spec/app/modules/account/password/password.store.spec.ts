import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';
import PasswordStore from 'app/modules/account/password/password.store';
import * as notifications from 'app/config/notification-middleware-mobx';
import * as reactJhipster from 'react-jhipster';

jest.mock('axios');
jest.mock('react-jhipster');
const axiosMock = axios as jest.Mocked<typeof axios>;
const reactJhipsterMock = reactJhipster as jest.Mocked<typeof reactJhipster>;

describe('Password store tests', () => {
  describe('Common tests', () => {
    it('Should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new PasswordStore(null);
      expect(operationHandlerSpy).toHaveBeenLastCalledWith(store, store.savePasswordGen, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new PasswordStore(rootStore as any);
      jest.clearAllMocks();
      (notifications as any).responseFailure = jest.fn();
      (notifications as any).responseSuccess = jest.fn();
    });

    it('savePasswordGen should send toast and return response', function* () {
      const currentPassword = 'oldPass',
        newPassword = 'newPass';
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const result = yield store.savePasswordGen(currentPassword, newPassword);
      expect(axiosMock.post).toBeCalledWith('/api/account/change-password', {
        currentPassword,
        newPassword,
      });
      expect(notifications.responseSuccess).toBeCalledWith(axiosResponse, expect.any(String));
      expect(result).toBe(axiosResponse);
    });

    it('savePasswordGen should send toast on failure and return response', function* () {
      const currentPassword = 'oldPass',
        newPassword = 'newPass';
      const axiosRejection = { response: { data: { errorKey: 'msgKey' } } };
      axiosMock.post.mockRejectedValueOnce(axiosRejection);
      try {
        yield store.savePasswordGen(currentPassword, newPassword);
        fail('should not reach this line because of an error');
      } catch (e) {
        expect(e).toBe(axiosRejection);
      }
      expect(axiosMock.post).toBeCalledWith('/api/account/change-password', {
        currentPassword,
        newPassword,
      });
      expect(notifications.responseFailure).toBeCalledWith(axiosRejection, expect.any(String));
    });
  });
});
