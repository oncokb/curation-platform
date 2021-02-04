import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';

const apiUrl = '/api/account/reset-password';

export class PasswordResetStore extends BaseStore {
  @observable public activationSuccess = false;
  @observable public activationFailure = false;
  @observable public loading = false;
  private finishSuccessMessage = '<strong>Your password has been reset.</strong> Please ';
  private initSuccessMessage = 'Check your emails for details on how to reset your password.';
  private initErrorMessage = '';

  @action
  handlePasswordResetInit = this.readHandler(this.handlePasswordResetInitGen, this.finishSuccessMessage);

  @action
  handlePasswordResetFinish = this.readHandler(this.handlePasswordResetFinishGen, this.initSuccessMessage, this.initErrorMessage);

  @action.bound
  reset() {
    this.activationSuccess = false;
    this.activationFailure = false;
    this.loading = false;
  }

  *handlePasswordResetInitGen(mail) {
    try {
      const result: AxiosResponse = yield axios.post(`${apiUrl}/init`, mail, { headers: { ['Content-Type']: 'text/plain' } });
      this.activationSuccess = true;
      return result;
    } catch (e) {
      this.activationFailure = true;
      throw e;
    }
  }

  *handlePasswordResetFinishGen(key, newPassword) {
    try {
      const result: AxiosResponse = yield axios.post(`${apiUrl}/finish`, { key, newPassword });
      this.activationSuccess = true;
      return result;
    } catch (e) {
      this.activationFailure = true;
      throw e;
    }
  }
}

export default PasswordResetStore;
