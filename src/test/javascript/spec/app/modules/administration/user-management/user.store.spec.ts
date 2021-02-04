import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import { toJS } from 'mobx';
import UserStore from 'app/modules/administration/user-management/user.store';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('OperationHandler tests', () => {
  const initialState = {
    roles: [],
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new UserStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new UserStore(null);
      expect(operationHandlerSpy).toBeCalledTimes(6);
      expect(operationHandlerSpy).toHaveBeenLastCalledWith(store, store.getAllRoles, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new UserStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('getAllRoles should set role and return response', function* () {
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.getAllRoles();
      expect(axiosMock.get).toBeCalledWith(`api/users/authorities`);
      expect(result).toBe(axiosResponse);
      expect(store.roles).toStrictEqual(axiosResponse.data);
    });
  });
});
