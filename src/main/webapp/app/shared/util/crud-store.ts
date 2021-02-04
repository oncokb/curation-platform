import axios, { AxiosResponse } from 'axios';
import { IRootStore } from 'app/shared/stores';
import BaseCrudStore from 'app/shared/util/base-crud-store';

export class CrudStore<T> extends BaseCrudStore<T> {
  links: { [key: string]: number };

  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore, apiUrl, settings);
  }

  *getAll(page, size, sort) {
    return yield* this.getAllFromLastUrl();
  }

  *getAllFromLastUrl() {
    const result: AxiosResponse<T[]> = yield axios.get(`${this.apiUrl}?cacheBuster=${Date.now()}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return result;
  }
}

export default CrudStore;
