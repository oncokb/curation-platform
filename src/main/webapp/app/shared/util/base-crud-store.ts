import axios, { AxiosResponse } from 'axios';
import { action } from 'mobx';
import { ICrudDeleteAction, ICrudPutAction } from 'app/shared/util/jhipster-types';
import { IRootStore } from 'app/shared/stores';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { BaseReadStore } from 'app/shared/util/base-read-store';

export abstract class BaseCrudStore<T> extends BaseReadStore<T> {
  @action
  createEntity: ICrudPutAction<T> = this.updateHandler(this.create);

  @action
  updateEntity: ICrudPutAction<T> = this.updateHandler(this.update);

  @action
  deleteEntity: ICrudDeleteAction<T> = this.updateHandler(this.delete);

  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore, apiUrl, settings);
  }

  *create(entity: T) {
    const result: AxiosResponse<T> = yield axios.post(this.apiUrl, cleanEntity(entity));
    this.entity = result.data;
    yield* this.checkEntities();
    return result;
  }

  *update(entity: T) {
    const result: AxiosResponse<T> = yield axios.put(this.apiUrl, cleanEntity(entity));
    this.entity = result.data;
    yield* this.checkEntities();
    return result;
  }

  *delete(_id) {
    const requestUrl = `${this.apiUrl}/${_id}`;
    const result: AxiosResponse<T> = yield axios.delete(requestUrl);
    this.resetEntity();
    yield* this.checkEntities();
    return result;
  }
}

export default BaseCrudStore;
