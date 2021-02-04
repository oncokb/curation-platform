import axios, { AxiosResponse } from 'axios';

import { createStores } from 'app/shared/stores';
import { toJS } from 'mobx';
import * as operationHandler from 'app/shared/util/operation-handler';
import { part } from '../../utils';
import AdministrationStore from 'app/modules/administration/administration.store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Administration store tests', () => {
  const initialState = {
    audits: [],
    configuration: {
      configProps: {},
      env: {},
    },
    errorMessage: null,
    gateway: {
      routes: [],
    },
    health: {},
    loading: false,
    logs: {
      loggers: [],
    },
    metrics: {},
    rootStore: null,
    threadDump: [],
    totalItems: 0,
    updateSuccess: false,
    updating: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new AdministrationStore(null);
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use operationHandler', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const adminStore = new AdministrationStore(null);
      expect(adminStore).toBeTruthy();
      expect(operationHandlerSpy).toBeCalledTimes(9);
    });
  });

  describe('Actions', () => {
    let store;
    const axiosResponse = part<AxiosResponse>({ data: new Object() });

    beforeEach(() => {
      const rootStore = createStores(null);
      store = new AdministrationStore(rootStore as any);
      jest.clearAllMocks();
    });

    it('gateRoutes should set routes and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.gateRoutes();
      expect(axiosMock.get).toBeCalledWith('/api/gateway/routes');
      expect(result).toBe(axiosResponse);
      expect(store.gateway.routes).toStrictEqual(axiosResponse.data);
    });

    it('sysHealth should set health and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.sysHealth();
      expect(axiosMock.get).toBeCalledWith('/management/health');
      expect(result).toBe(axiosResponse);
      expect(store.health).toStrictEqual(axiosResponse.data);
    });

    it('sysMetrics should set jhimetrics and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.sysMetrics();
      expect(axiosMock.get).toBeCalledWith('/management/jhimetrics');
      expect(result).toBe(axiosResponse);
      expect(store.metrics).toStrictEqual(axiosResponse.data);
    });

    it('sysThreadDump should set threadDump and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.sysThreadDump();
      expect(axiosMock.get).toBeCalledWith('/management/threaddump');
      expect(result).toBe(axiosResponse);
      expect(store.threadDump).toStrictEqual(axiosResponse.data);
    });

    it('loggers should set loggers and return response', function* () {
      axiosResponse.data.loggers = new Object();
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.loggers();
      expect(axiosMock.get).toBeCalledWith('/management/loggers');
      expect(result).toBe(axiosResponse);
      expect(store.logs.loggers).toStrictEqual(axiosResponse.data.loggers);
    });

    it('changeLogLev should call loggers and return response', function* () {
      axiosMock.post.mockResolvedValueOnce(axiosResponse);
      const mock = jest.fn();
      store.loggers = function* () {
        return yield new Promise(resolve => {
          resolve();
          mock();
        });
      };
      const result = yield* store.changeLogLev('springLoggers', 'info');
      expect(axiosMock.post).toBeCalledWith('/management/loggers/springLoggers', { configuredLevel: 'info' });
      expect(result).toBe(axiosResponse);
      expect(mock).toBeCalled();
    });

    it('getConf should set configProp and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.getConf();
      expect(axiosMock.get).toBeCalledWith('/management/configprops');
      expect(result).toBe(axiosResponse);
      expect(store.configuration.configProps).toStrictEqual(axiosResponse.data);
    });

    it('getEnvir should set env and return response', function* () {
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.getEnvir();
      expect(axiosMock.get).toBeCalledWith('/management/env');
      expect(result).toBe(axiosResponse);
      expect(store.configuration.env).toStrictEqual(axiosResponse.data);
    });

    it('getAudit without params should make request and return response', function* () {
      const count = 123;
      axiosResponse.headers = { 'x-total-count': count };
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      store.loggers = jest.fn().mockResolvedValue(null);
      const result = yield store.getAudit();
      expect(axiosMock.get).toBeCalledWith('/management/audits');
      expect(result).toBe(axiosResponse);
      expect(store.audits).toStrictEqual(axiosResponse.data);
      expect(store.totalItems).toStrictEqual(count);
    });

    it('getAudit with params shouldmake request and return response', function* () {
      const count = 123;
      axiosResponse.headers = { 'x-total-count': count };
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      store.loggers = jest.fn().mockResolvedValue(null);
      const result = yield store.getAudit(2, 34, 'id', '2018-01-02', '2019-03-04');
      expect(axiosMock.get).toBeCalledWith('/management/audits?page=2&size=34&sort=id&fromDate=2018-01-02&toDate=2019-03-04');
      expect(result).toBe(axiosResponse);
      expect(store.audits).toStrictEqual(axiosResponse.data);
      expect(store.totalItems).toStrictEqual(count);
    });
  });
});
