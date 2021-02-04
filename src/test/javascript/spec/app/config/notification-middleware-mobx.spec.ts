import * as toastify from 'react-toastify'; // synthetic default import doesn't work here due to mocking.
import sinon from 'sinon';

import * as notificationMiddleware from 'app/config/notification-middleware-mobx';

describe('Notification Middleware', () => {
  const DEFAULT_SUCCESS_MESSAGE = 'fooSuccess';
  const DEFAULT_ERROR_MESSAGE = 'fooError';
  const HEADER_SUCCESS = {
    status: 201,
    statusText: 'Created',
    headers: { 'app-alert': 'foo.created', 'app-params': 'foo' },
  };
  const UHNKNOWN_HEADER = {
    statusText: 'Created',
    headers: { 'app-new': 'whatever' },
  };
  const DEFAULT_ERROR = {
    message: DEFAULT_ERROR_MESSAGE,
  };
  const VALIDATION_ERROR = {
    response: {
      data: {
        type: 'https://www.jhipster.tech/problem/constraint-violation',
        title: 'Method argument not valid',
        status: 400,
        path: '/api/foos',
        message: 'error.validation',
        fieldErrors: [{ objectName: 'foos', field: 'minField', message: 'Min' }],
      },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
    },
  };
  const API_ACCOUNT_ERROR = {
    response: {
      data: {
        path: '/api/account',
      },
      status: 401,
    },
  };
  const OTHER_VALIDATION_ERROR_WITH_MESSAGE = {
    response: {
      data: {
        message: 'error.validation.with.message',
      },
      status: 400,
      headers: {},
    },
  };
  const OTHER_VALIDATION_ERROR = {
    response: {
      data: 'error.validation.data',
      status: 400,
      headers: {},
    },
  };
  const HEADER_ERRORS = {
    response: {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'app-error': 'foo.creation', 'app-params': 'foo', 'app-new': 'whatever' },
    },
  };
  const NOT_FOUND_ERROR = {
    response: {
      data: {
        status: 404,
        message: 'Not found',
      },
      status: 404,
    },
  };
  const NO_SERVER_ERROR = {
    response: {
      status: 0,
    },
  };
  const GENERIC_ERROR = {
    response: {
      data: {
        message: 'Error',
      },
    },
  };

  beforeEach(() => {
    sinon.spy(toastify.toast, 'error');
    sinon.spy(toastify.toast, 'success');
  });

  afterEach(() => {
    (toastify.toast as any).error.restore();
    (toastify.toast as any).success.restore();
  });

  it('should trigger a success toast message and return promise success', () => {
    notificationMiddleware.responseSuccess('foo', DEFAULT_SUCCESS_MESSAGE);
    const toastMsg = (toastify.toast as any).success.getCall(0).args[0];
    expect(toastMsg).toEqual(DEFAULT_SUCCESS_MESSAGE);
  });

  it('should bot trigger a success toast message with unknown header and no message', () => {
    notificationMiddleware.responseSuccess(UHNKNOWN_HEADER);
    expect((toastify.toast as any).called).toBeFalsy();
  });

  it('should survive without paramter values', () => {
    notificationMiddleware.responseSuccess(undefined);
    expect((toastify.toast as any).called).toBeFalsy();
  });

  it('should trigger a success toast message and return promise success for header alerts', () => {
    notificationMiddleware.responseSuccess(HEADER_SUCCESS);
    const toastMsg = (toastify.toast as any).success.getCall(0).args[0];
    expect(toastMsg).toContain('foo.created');
  });

  it('should trigger an error toast message and return promise error', () => {
    notificationMiddleware.responseFailure(DEFAULT_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toEqual(DEFAULT_ERROR_MESSAGE);
  });

  it('should not trigger an error toast message for api account error', () => {
    notificationMiddleware.responseFailure(API_ACCOUNT_ERROR);
    expect((toastify.toast as any).called).toBeFalsy();
  });

  it('should trigger an error toast message with custom error', () => {
    notificationMiddleware.responseFailure('foo', 'customError');
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toEqual('customError');
  });

  it('should trigger an error toast message with Unknown error!', () => {
    notificationMiddleware.responseFailure(null);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toEqual('Unknown error!');
  });

  it('should trigger an error toast message with only data in response!', () => {
    notificationMiddleware.responseFailure({ response: { data: 'error.key' } });
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('error.key');
  });

  it('should trigger an error toast message and return promise error for generic message', () => {
    notificationMiddleware.responseFailure(GENERIC_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('Error');
  });

  it('should trigger an error toast message and return promise error for 400 response code with field size errors', () => {
    notificationMiddleware.responseFailure(VALIDATION_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('Error on field "MinField"');
  });

  it('should trigger an error toast message and return promise error for 400 response code with other message', () => {
    notificationMiddleware.responseFailure(OTHER_VALIDATION_ERROR_WITH_MESSAGE);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('error.validation.with.message');
  });

  it('should trigger an error toast message and return promise error for 400 response code with just error code', () => {
    notificationMiddleware.responseFailure(OTHER_VALIDATION_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('error.validation.data');
  });

  it('should trigger an error toast message and return promise error for 404 response code', () => {
    notificationMiddleware.responseFailure(NOT_FOUND_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('Not found');
  });

  it('should trigger an error toast message and return promise error for 0 response code', () => {
    notificationMiddleware.responseFailure(NO_SERVER_ERROR);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('Server not reachable');
  });

  it('should trigger an error toast message and return promise error for headers containing errors', () => {
    notificationMiddleware.responseFailure(HEADER_ERRORS);
    const toastMsg = (toastify.toast as any).error.getCall(0).args[0];
    expect(toastMsg).toContain('foo.creation');
  });
});
