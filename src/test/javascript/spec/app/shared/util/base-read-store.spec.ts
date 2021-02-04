import * as mobx from 'mobx';
import { autorun, onBecomeUnobserved, toJS } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../utils';
import BaseReadStore from 'app/shared/util/base-read-store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

class BaseReadStoreImpl extends BaseReadStore<{}> {
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
      const store = new BaseReadStoreImpl(null, apiUrl);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use updateHandler and operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const store = new BaseReadStoreImpl(null, apiUrl);
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.getAll, expect.any(Function));
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, store.get, expect.any(Function));
    });

    it('should register becoming unobserved handlers', () => {
      const onBecomeUnobservedSpy = jest.spyOn(mobx, 'onBecomeUnobserved');
      const store = new BaseReadStoreImpl(null, apiUrl, { clearOnUnobserved: true });
      expect(onBecomeUnobservedSpy).toHaveBeenCalledWith(store, 'entities', store.resetEntities);
      expect(onBecomeUnobservedSpy).toHaveBeenCalledWith(store, 'entity', store.resetEntity);
    });
  });

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      store = new BaseReadStoreImpl(null, apiUrl);
      jest.clearAllMocks();
    });

    it('should reset state to initial', () => {
      store.entities = [{}, {}];
      store.entity = {};
      store.totalItems = 1;
      store.lastUrl = 'error updating';
      store.reset();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should reset Entity state to initial', () => {
      store.entity = {};
      store.resetEntity();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should reset Entities state to initial', () => {
      store.entities = [{}, {}];
      store.totalItems = 1;
      store.resetEntities();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('get should reset and get', function* () {
      const data = new Object();
      const axiosResponse = part<AxiosResponse>({ data });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const resetEntitySpy = jest.spyOn(store, 'resetEntity');
      const result = yield store.get('a');
      expect(resetEntitySpy).toHaveBeenCalledTimes(1);
      expect(axiosMock.get).toBeCalledWith('/api/entities/a');
      expect(store.entity).toStrictEqual(data);
      expect(result).toBe(axiosResponse);
    });

    it('checkEntities should not call getAllFromLastUrl when there are no observers', function* () {
      const getAllFromLastUrlSpy = jest.spyOn(store, 'getAllFromLastUrl');
      const result = yield store.checkEntities();
      expect(getAllFromLastUrlSpy).toHaveBeenCalledTimes(0);
    });

    it('checkEntities should call getAllFromLastUrl when there are observers', function* () {
      autorun(() => store.entities.length);
      const getAllFromLastUrlSpy = jest.spyOn(store, 'getAllFromLastUrl');
      yield store.checkEntities();
      expect(getAllFromLastUrlSpy).toHaveBeenCalledTimes(1);
    });
  });
});
