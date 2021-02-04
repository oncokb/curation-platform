import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import BaseStore from 'app/shared/util/base-store';
import { responseSuccess } from 'app/config/notification-middleware-mobx';

export class RegisterStore extends BaseStore {
  @observable public registrationSuccess = false;
  @observable public registrationFailure = false;

  @action
  handleRegister = this.readHandler(this.handleRegisterGen);

  @action.bound
  reset() {
    this.loading = false;
    this.registrationSuccess = false;
    this.registrationFailure = false;
    this.errorMessage = null;
  }

  *handleRegisterGen(login, email, password, langKey = 'en') {
    this.loading = true;
    try {
      const result: AxiosResponse = yield axios.post('/api/register', { login, email, password, langKey });
      this.registrationSuccess = true;
      this.loading = false;
      const msg = '<strong>Registration saved!</strong> Please check your email for confirmation.';
      responseSuccess(result, msg);
      return result;
    } catch (e) {
      this.registrationFailure = true;
      this.loading = false;
      this.errorMessage = e.response.data.errorKey;
      throw e;
    }
  }
}

export default RegisterStore;
