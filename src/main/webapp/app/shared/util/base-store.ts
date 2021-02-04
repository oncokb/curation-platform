import { flow, observable } from 'mobx';
import { IRootStore } from 'app/shared/stores';
import { handleOperation, OperationStatus } from 'app/shared/util/operation-handler';
import { responseFailure, responseSuccess } from 'app/config/notification-middleware-mobx';

export class BaseStore {
  @observable public loading = false;
  @observable public errorMessage = null;
  @observable public updating = false;
  @observable public updateSuccess = false;

  constructor(protected rootStore: IRootStore) {}

  protected resetBase() {
    this.loading = false;
    this.errorMessage = null;
    this.updating = false;
    this.updateSuccess = false;
  }

  updateHandler = <T, TArgs>(param: (...args: TArgs[]) => IterableIterator<Promise<T>>, successMessage?, errorMessage?) =>
    flow(handleOperation(this, param, this.updateOperationHandler(successMessage, errorMessage)));

  updateOperationHandler = (successMessage?, errorMessage?) => {
    return (state: OperationStatus, result?, error?) => {
      switch (state) {
        case OperationStatus.IN_PROGRESS: {
          this.updateSuccess = false;
          this.rootStore.loadingStore.showLoading();
          this.updating = true;
          this.errorMessage = null;
          break;
        }
        case OperationStatus.SUCCESSFUL: {
          this.updateSuccess = true;
          responseSuccess(result, successMessage);
          this.updating = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
        case OperationStatus.ERROR:
        default: {
          this.updateSuccess = false;
          const translatedMessage = errorMessage;
          this.errorMessage = translatedMessage || (error && error.message);
          responseFailure(error, translatedMessage);
          this.updating = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
      }
    };
  };

  readHandler = <T, TArgs>(param: (...args: TArgs[]) => IterableIterator<Promise<T>>, successMessage?, errorMessage?) =>
    flow(handleOperation(this, param, this.readOperationHandler(successMessage, errorMessage)));

  readOperationHandler = (successMessage?, errorMessage?) => {
    return (state: OperationStatus, result?, error?) => {
      switch (state) {
        case OperationStatus.IN_PROGRESS: {
          this.rootStore.loadingStore.showLoading();
          this.loading = true;
          this.errorMessage = null;
          this.updateSuccess = false;
          break;
        }
        case OperationStatus.SUCCESSFUL: {
          responseSuccess(result, successMessage);
          this.loading = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
        case OperationStatus.ERROR:
        default: {
          const translatedMessage = errorMessage;
          this.errorMessage = translatedMessage || (error && error.message);
          responseFailure(error, translatedMessage);
          this.loading = false;
          this.rootStore.loadingStore.hideLoading();
          break;
        }
      }
    };
  };
}

export default BaseStore;
