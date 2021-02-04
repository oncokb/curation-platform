import { toJS } from 'mobx';
import * as operationHandler from 'app/shared/util/operation-handler';
import BaseStore from 'app/shared/util/base-store';

import * as notifications from 'app/config/notification-middleware-mobx';
import { OperationStatus } from 'app/shared/util/operation-handler';
jest.mock('react-jhipster');
import * as reactJhipster from 'react-jhipster';
const reactJhipsterMock = reactJhipster as jest.Mocked<typeof reactJhipster>;

describe('Base store tests', () => {
  const initialState = {
    loading: false,
    errorMessage: null,
    updating: false,
    updateSuccess: false,
  };

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const store = new BaseStore(null);
      expect(toJS(store)).toMatchObject(initialState);
      (notifications as any).responseFailure = jest.fn();
      (notifications as any).responseSuccess = jest.fn();
    });
  });

  describe('Actions', () => {
    let store;
    let rootStore;

    beforeEach(() => {
      rootStore = { loadingStore: { showLoading: jest.fn(), hideLoading: jest.fn() } };
      store = new BaseStore(rootStore);
      jest.clearAllMocks();
    });

    it('should reset state to initial', () => {
      store.loading = true;
      store.errorMessage = 'error updating';
      store.updating = true;
      store.updateSuccess = true;
      store.resetBase();
      expect(toJS(store)).toMatchObject(initialState);
    });

    it('should use updateHandler and read handlers', () => {
      const operationHandlerSpy = jest.spyOn(operationHandler, 'handleOperation');
      const readOperationHandlerResult = new Object();
      const updateOperationHandlerResult = new Object();
      store.readOperationHandler = jest.fn().mockReturnValueOnce(readOperationHandlerResult);
      store.updateOperationHandler = jest.fn().mockReturnValueOnce(updateOperationHandlerResult);
      const param = jest.fn();
      store.readHandler(param, 'readSuccess', 'readError');
      store.updateHandler(param, 'updateSuccess', 'updateError');
      expect(store.readOperationHandler).toHaveBeenCalledWith('readSuccess', 'readError');
      expect(store.updateOperationHandler).toHaveBeenCalledWith('updateSuccess', 'updateError');
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, param, readOperationHandlerResult);
      expect(operationHandlerSpy).toHaveBeenCalledWith(store, param, updateOperationHandlerResult);
    });

    it('updateOperationHandler should set pending on progress', () => {
      store.updateOperationHandler()(OperationStatus.IN_PROGRESS);
      const expectedState = {
        loading: false,
        updateSuccess: false,
        updating: true,
        errorMessage: null,
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.showLoading)).toHaveBeenCalled();
    });

    it('updateOperationHandler should set error state on error with defined message', () => {
      const error = {};
      reactJhipsterMock.translate.mockReturnValueOnce('errorMsg');
      store.updateOperationHandler(null, 'errorMsg')(OperationStatus.ERROR, null, error);
      const expectedState = {
        loading: false,
        updateSuccess: false,
        updating: false,
        errorMessage: 'errorMsg',
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseFailure).toBeCalledWith(error, 'errorMsg');
    });

    it('updateOperationHandler should set error state on error with error object', () => {
      const error = { message: 'errorMsg' };
      store.updateOperationHandler()(OperationStatus.ERROR, null, error);
      const expectedState = {
        loading: false,
        updateSuccess: false,
        updating: false,
        errorMessage: 'errorMsg',
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseFailure).toBeCalledWith(error, undefined);
    });

    it('updateOperationHandler should set success state on success', () => {
      const result = {};
      reactJhipsterMock.translate.mockReturnValueOnce('successMsg');
      store.updateOperationHandler('successMsg')(OperationStatus.SUCCESSFUL, result);
      const expectedState = {
        loading: false,
        updateSuccess: true,
        updating: false,
        errorMessage: null,
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseSuccess).toBeCalledWith(result, 'successMsg');
    });

    it('readOperationHandler should set pending on progress', () => {
      store.readOperationHandler()(OperationStatus.IN_PROGRESS);
      const expectedState = {
        loading: true,
        updating: false,
        errorMessage: null,
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.showLoading)).toHaveBeenCalled();
    });

    it('readOperationHandler should set error state on error with defined message', () => {
      const error = {};
      reactJhipsterMock.translate.mockReturnValueOnce('errorMsg');
      store.readOperationHandler(null, 'errorMsg')(OperationStatus.ERROR, null, error);
      const expectedState = {
        loading: false,
        updating: false,
        errorMessage: 'errorMsg',
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseFailure).toBeCalledWith(error, 'errorMsg');
    });

    it('readOperationHandler should set error state on error with error object', () => {
      const error = { message: 'errorMsg' };
      store.readOperationHandler()(OperationStatus.ERROR, null, error);
      const expectedState = {
        loading: false,
        updating: false,
        errorMessage: 'errorMsg',
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseFailure).toBeCalledWith(error, undefined);
    });

    it('readOperationHandler should set success state on success', () => {
      const result = {};
      reactJhipsterMock.translate.mockReturnValueOnce('successMsg');
      store.readOperationHandler('successMsg')(OperationStatus.SUCCESSFUL, result);
      const expectedState = {
        loading: false,
        updating: false,
        errorMessage: null,
      };
      expect(toJS(store)).toMatchObject(expectedState);
      expect(toJS(rootStore.loadingStore.hideLoading)).toHaveBeenCalled();
      expect(notifications.responseSuccess).toBeCalledWith(result, 'successMsg');
    });
  });
});
