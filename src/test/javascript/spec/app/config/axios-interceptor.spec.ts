import axios from 'axios';

import setupAxiosInterceptors from 'app/config/axios-interceptor';
import * as reactJhipster from 'react-jhipster';
import { AUTH_TOKEN_KEY } from 'app/shared/stores';

jest.mock('react-jhipster');
const sessionStorage = reactJhipster.Storage.session;
const sessionStorageMock = sessionStorage as jest.Mocked<typeof sessionStorage>;

describe('Axios Interceptor', () => {
  describe('setupAxiosInterceptors', () => {
    const client = axios;
    const onUnauthenticated = jest.fn();
    setupAxiosInterceptors(onUnauthenticated);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('onRequestSuccess is called on fulfilled request', () => {
      expect((client.interceptors.request as any).handlers[0].fulfilled({ data: 'foo', url: '/test' })).toMatchObject({
        data: 'foo',
      });
    });

    it('onRequestSuccess is called on fulfilled request and sets token', () => {
      const token = 'token';
      sessionStorageMock.get.mockReturnValueOnce(token);
      expect((client.interceptors.request as any).handlers[0].fulfilled({ data: 'foo', url: '/test', headers: {} })).toMatchObject({
        data: 'foo',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(sessionStorageMock.get).toBeCalledWith(AUTH_TOKEN_KEY);
    });

    it('onResponseSuccess is called on fulfilled response', () => {
      expect((client.interceptors.response as any).handlers[0].fulfilled({ data: 'foo' })).toEqual({ data: 'foo' });
    });

    it('onResponseError and onUnauthenticated is called on rejected 401 response', () => {
      (client.interceptors.response as any).handlers[0].rejected({
        response: {
          statusText: 'NotFound',
          status: 403,
          data: { message: 'Page not found' },
        },
      });
      expect(onUnauthenticated).toBeCalledTimes(1);
    });

    it('onResponseError is called on rejected response', () => {
      (client.interceptors.response as any).handlers[0].rejected({
        response: {
          status: 500,
        },
      });
      expect(onUnauthenticated).toBeCalledTimes(0);
    });
  });
});
