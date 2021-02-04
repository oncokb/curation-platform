import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';
import SettingsStore from 'app/modules/account/settings/settings.store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Settings store tests', () => {
  describe('Common tests', () => {
    it('should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new SettingsStore(null);
      expect(operationHandlerSpy).toHaveBeenLastCalledWith(store, store.saveAccountSettingsGen, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new SettingsStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('saveAccountSettingsGen should post and call get session', function* () {
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      store.rootStore.authStore.getSession = jest.fn().mockResolvedValueOnce(null);
      const result = yield store.saveAccountSettingsGen('acc');
      expect(axiosMock.post).toBeCalledWith('/api/account', 'acc');
      expect(store.rootStore.authStore.getSession).toBeCalledTimes(1);
      expect(result).toBe(axiosResponse);
    });

    it('reset should call resetBase', function () {
      jest.spyOn(store, 'resetBase');
      store.reset();
    });
  });
});
