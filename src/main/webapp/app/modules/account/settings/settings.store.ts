import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';

const apiUrl = '/api/account';

export class SettingsStore extends BaseStore {
  @observable public loading = false;
  @observable public errorMessage = null;
  @observable public updateSuccess = false;
  @observable public updateFailure = false;
  private successMsg = '<strong>Settings saved!</strong>';
  @action
  saveAccountSettings = this.updateHandler(this.saveAccountSettingsGen, this.successMsg);

  @action.bound
  reset() {
    super.resetBase();
    this.loading = false;
    this.errorMessage = null;
    this.updateSuccess = false;
    this.updateFailure = false;
  }

  // Actions
  *saveAccountSettingsGen(account) {
    const result: AxiosResponse = yield axios.post(apiUrl, account);
    yield this.rootStore.authStore.getSession();
    return result;
  }
}

export default SettingsStore;
