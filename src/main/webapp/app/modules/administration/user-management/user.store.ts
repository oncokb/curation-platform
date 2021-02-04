import { IUser } from 'app/shared/model/user.model';
import { IRootStore } from 'app/shared/stores';
import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { ICrudGetAllAction } from 'app/shared/util/jhipster-types';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/users';

export class UserStore extends PaginationCrudStore<IUser> {
  @observable public roles = [];

  @action
  getRoles: ICrudGetAllAction<any> = this.readHandler(this.getAllRoles);

  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }

  *getAllRoles() {
    const result: AxiosResponse = yield axios.get(`${this.apiUrl}/authorities`);
    this.roles = result.data;
    return result;
  }
}

export default UserStore;
