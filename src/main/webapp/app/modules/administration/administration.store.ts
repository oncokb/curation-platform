import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
export class AdministrationStore extends BaseStore {
  @observable public gateway = {
    routes: [],
  };
  @observable public logs = {
    loggers: [] as any[],
  };
  @observable public health: any = {};
  @observable public metrics: any = {};
  @observable public threadDump = [];
  @observable public configuration = {
    configProps: {} as any,
    env: {} as any,
  };
  @observable public audits = [];
  @observable public totalItems = 0;

  @action
  gatewayRoutes = this.readHandler(this.gateRoutes);

  @action
  systemHealth = this.readHandler(this.sysHealth);

  @action
  systemMetrics = this.readHandler(this.sysMetrics);

  @action
  systemThreadDump = this.readHandler(this.sysThreadDump);

  @action
  getLoggers = this.readHandler(this.loggers);

  @action
  changeLogLevel = this.updateHandler(this.changeLogLev);

  @action
  getConfigurations = this.readHandler(this.getConf);

  @action
  getEnv = this.readHandler(this.getEnvir);

  @action
  getAudits = this.readHandler(this.getAudit);

  // Actions
  *gateRoutes() {
    const result: AxiosResponse = yield axios.get('/api/gateway/routes');
    this.gateway.routes = result.data;
    return result;
  }

  *sysHealth() {
    const result: AxiosResponse = yield axios.get('/management/health');
    this.health = result.data;
    return result;
  }

  *sysMetrics() {
    const result: AxiosResponse = yield axios.get('/management/jhimetrics');
    this.metrics = result.data;
    return result;
  }

  *sysThreadDump() {
    const result: AxiosResponse = yield axios.get('/management/threaddump');
    this.threadDump = result.data;
    return result;
  }

  *loggers() {
    const result: AxiosResponse = yield axios.get('/management/loggers');
    this.logs.loggers = result.data.loggers;
    return result;
  }

  *changeLogLev(name, configuredLevel) {
    const body = { configuredLevel };
    const result: AxiosResponse = yield axios.post('/management/loggers/' + name, body);
    yield* this.loggers();
    return result;
  }

  *getConf() {
    const result: AxiosResponse = yield axios.get('/management/configprops');
    this.configuration.configProps = result.data;
    return result;
  }

  *getEnvir() {
    const result: AxiosResponse = yield axios.get('/management/env');
    this.configuration.env = result.data;
    return result;
  }

  *getAudit(page, size, sort, fromDate, toDate) {
    let requestUrl = `/management/audits${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    if (fromDate) {
      requestUrl += `&fromDate=${fromDate}`;
    }
    if (toDate) {
      requestUrl += `&toDate=${toDate}`;
    }
    const result: AxiosResponse = yield axios.get(requestUrl);
    this.audits = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default AdministrationStore;
