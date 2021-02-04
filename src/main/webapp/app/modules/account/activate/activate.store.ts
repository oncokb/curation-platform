import { action, observable } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { IUser } from 'app/shared/model/user.model';
import BaseStore from 'app/shared/util/base-store';

export class ActivateStore extends BaseStore {
  @observable public activationSuccess = false;
  @observable public activationFailure = false;

  @action
  activateAction = this.readHandler(this.activateActionGen);

  @action.bound
  reset() {
    this.activationSuccess = false;
    this.activationFailure = false;
  }

  *activateActionGen(key) {
    try {
      const result: AxiosResponse = yield axios.get('/api/activate?key=' + key);
      this.activationSuccess = true;
      return result;
    } catch (e) {
      this.activationFailure = true;
      throw e;
    }
  }
}

export default ActivateStore;
