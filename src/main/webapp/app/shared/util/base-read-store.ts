import axios, { AxiosResponse } from 'axios';
import { action, getObserverTree, observable, onBecomeUnobserved } from 'mobx';
import { ICrudGetAction, ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import BaseStore from 'app/shared/util/base-store';
import { IRootStore } from 'app/shared/stores';

export abstract class BaseReadStore<T> extends BaseStore {
  @observable public entities: ReadonlyArray<T>;
  @observable public entity: Readonly<T>;
  @observable public totalItems;
  @observable public lastUrl: string;

  @action
  getEntities: ICrudGetAllAction<T> = this.readHandler(this.getAll);

  @action
  getEntity: ICrudGetAction<T> = this.readHandler(this.get);

  @action.bound
  reset = this.resetBase;

  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore);
    this.reset();
    if (settings.clearOnUnobserved) {
      onBecomeUnobserved(this, 'entities', this.resetEntities);
      onBecomeUnobserved(this, 'entity', this.resetEntity);
    }
  }

  @action.bound
  resetEntity() {
    this.entity = {} as any;
  }

  @action.bound
  resetEntities() {
    this.entities = [];
    this.totalItems = 0;
    this.lastUrl = `${this.apiUrl}`;
  }

  protected resetBase() {
    super.resetBase();
    this.resetEntity();
    this.resetEntities();
  }

  abstract getAll(page, size, sort);

  abstract getAllFromLastUrl();

  *get(id: string | number) {
    this.resetEntity();
    const result: AxiosResponse<T> = yield axios.get(`${this.apiUrl}/${id}`);
    this.entity = result.data;
    return result;
  }

  *checkEntities() {
    const { observers } = getObserverTree(this.entities);
    if (observers && observers.length) {
      yield* this.getAllFromLastUrl();
    } else {
      this.resetEntities();
    }
  }
}

export default BaseReadStore;
