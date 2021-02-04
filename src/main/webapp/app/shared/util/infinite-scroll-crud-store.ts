import axios, { AxiosResponse } from 'axios';
import { IRootStore } from 'app/shared/stores';
import BaseCrudStore from './base-crud-store';
import { action, observable } from 'mobx';
import { loadMoreDataWhenScrolled, parseHeaderForLinks } from 'react-jhipster';

export class InfiniteScrollCrudStore<T> extends BaseCrudStore<T> {
  @observable public links: { [key: string]: number } = { last: 0 };

  constructor(protected rootStore: IRootStore, protected apiUrl: string, protected settings = { clearOnUnobserved: false }) {
    super(rootStore, apiUrl, settings);
  }

  protected resetBase() {
    super.resetBase();
    this.resetLinks();
  }

  @action.bound
  resetLinks() {
    this.links = { last: 0 };
  }

  *getAll(page, size, sort) {
    this.lastUrl = `${this.apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    return yield* this.getAllFromLastUrl();
  }

  *getAllFromLastUrl() {
    const result: AxiosResponse<T[]> = yield axios.get(this.lastUrl);
    this.links = parseHeaderForLinks(result.headers.link);
    this.entities = loadMoreDataWhenScrolled(this.entities, result.data, this.links);
    this.totalItems = parseInt(result.headers['x-total-count'], 10);
    return result;
  }
}

export default InfiniteScrollCrudStore;
