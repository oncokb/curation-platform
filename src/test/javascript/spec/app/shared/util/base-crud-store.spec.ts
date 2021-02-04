import { toJS } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import * as operationHandler from 'app/shared/util/operation-handler';
import BaseCrudStore from 'app/shared/util/base-crud-store';
import { part } from '../../utils';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

class BaseCrudStoreImpl extends BaseCrudStore<{}> {
  *getAll(page, size, sort) {
    return yield Promise.resolve();
  }

  *getAllFromLastUrl() {
    return yield Promise.resolve();
  }
}

describe('Base crud store tests', () => {
  const apiUrl = '/api/entities';

  const initialState = {
    entities: [],
    entity: {},
    totalItems: 0,
    lastUrl: apiUrl,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new BaseCrudStoreImpl(null, apiUrl);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use updateHandler and operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new BaseCrudStoreImpl(null, apiUrl);
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.create, expect.any(Function));
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.update, expect.any(Function));
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.delete, expect.any(Function));
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      store = new BaseCrudStoreImpl(null, apiUrl);
      jest.clearAllMocks();
    });

    it('create should post and check', function* () {
      const entity = new Object();
      const data = new Object();
      const axiosResponse = part<AxiosResponse>({ data });
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const checkEntitiesSpy = jest.spyOn(store, 'checkEntities');
      const result = yield store.create(entity);
      expect(axiosMock.post).toBeCalledWith('/api/entities', entity);
      expect(store.entity).toStrictEqual(data);
      expect(checkEntitiesSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(axiosResponse);
    });

    it('update should put and check', function* () {
      const entity = new Object();
      const data = new Object();
      const axiosResponse = part<AxiosResponse>({ data });
      axiosMock.put.mockResolvedValueOnce(axiosResponse);
      const checkEntitiesSpy = jest.spyOn(store, 'checkEntities');
      const result = yield store.update(entity);
      expect(axiosMock.put).toBeCalledWith('/api/entities', entity);
      expect(store.entity).toStrictEqual(data);
      expect(checkEntitiesSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(axiosResponse);
    });

    it('delete should delete, check and reset', function* () {
      const data = new Object();
      const axiosResponse = part<AxiosResponse>({ data });
      axiosMock.delete.mockResolvedValueOnce(axiosResponse);
      const checkEntitiesSpy = jest.spyOn(store, 'checkEntities');
      const resetEntitySpy = jest.spyOn(store, 'resetEntity');
      const result = yield store.delete('a');
      expect(axiosMock.delete).toBeCalledWith('/api/entities/a');
      expect(store.entity).toStrictEqual(data);
      expect(checkEntitiesSpy).toHaveBeenCalledTimes(1);
      expect(resetEntitySpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(axiosResponse);
    });
  });
});
