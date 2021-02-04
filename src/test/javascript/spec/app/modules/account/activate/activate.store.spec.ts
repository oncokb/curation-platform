import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import { toJS } from 'mobx';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../../utils';
import ActivateStore from 'app/modules/account/activate/activate.store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Activate store tests', () => {
  const initialState = {
    activationSuccess: false,
    activationFailure: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new ActivateStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new ActivateStore(null);
      expect(operationHandlerSpy).toHaveBeenLastCalledWith(store, store.activateActionGen, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new ActivateStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('should reset state to initial', () => {
      store.activationSuccess = true;
      store.activationFailure = true;
      store.reset();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('activateActionGen should set activationSuccess and return response', function* () {
      const axiosResponse = part<AxiosResponse>({ data: new Object() });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.activateActionGen('actKey');
      expect(axiosMock.get).toBeCalledWith('/api/activate?key=actKey');
      expect(result).toBe(axiosResponse);
      expect(store.activationSuccess).toBe(true);
    });

    it('activateActionGen should set activationFailure and return response', function* () {
      const axiosRejection = {};
      axiosMock.get.mockRejectedValueOnce(axiosRejection);
      try {
        yield store.activateActionGen('actKey');
        fail('should not reach this line because of an error');
      } catch (e) {
        expect(e).toBe(axiosRejection);
      }
      expect(axiosMock.get).toBeCalledWith('/api/activate?key=actKey');
      expect(store.activationFailure).toBe(true);
    });
  });
});
