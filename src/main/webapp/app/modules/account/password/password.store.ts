import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';

const apiUrl = '/api/account';

import { responseFailure, responseSuccess } from 'app/config/notification-middleware-mobx';

export class PasswordStore extends BaseStore {
  @observable public updateFailure = false;

  @action
  savePassword = this.readHandler(this.savePasswordGen);

  @action.bound
  reset() {
    this.updateFailure = false;
    this.loading = false;
    this.errorMessage = null;
    this.updateSuccess = false;
  }

  *savePasswordGen(currentPassword, newPassword) {
    try {
      this.updateFailure = false;
      this.errorMessage = null;
      this.updateSuccess = false;
      const result: AxiosResponse = yield axios.post(`${apiUrl}/change-password`, {
        currentPassword,
        newPassword,
      });
      this.updateSuccess = true;
      this.updateFailure = false;
      const msg = '<strong>Password changed!</strong>';
      responseSuccess(result, msg);
      return result;
    } catch (e) {
      this.updateSuccess = false;
      this.updateFailure = true;
      const msg = '<strong>An error has occurred!</strong> The password could not be changed.';
      responseFailure(e, msg);
      throw e;
    }
  }
}

export default PasswordStore;
