import axios, { AxiosResponse } from 'axios';
import { part } from '../../utils';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

describe('Pagination crud store tests', () => {
  const apiUrl = '/api/entities';

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      store = new PaginationCrudStore(null, apiUrl);
      jest.clearAllMocks();
    });

    it('getAllFromLastUrl should get and resetEntities', function* () {
      const now = 1562449572531;
      Date.now = jest.fn().mockReturnValue(now);
      const data = new Object();
      const count = 3;
      const axiosResponse = part<AxiosResponse>({ data, headers: { 'x-total-count': count } });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const result = yield store.getAllFromLastUrl();
      expect(axiosMock.get).toBeCalledWith(`/api/entities?cacheBuster=${now}`);
      expect(store.entities).toStrictEqual(data);
      expect(store.totalItems).toBe(count);
      expect(result).toBe(axiosResponse);
    });

    it('getAllFromLastUrl should get, resetEntities and use correct url', function* () {
      const now = 1562449572531;
      Date.now = jest.fn().mockReturnValue(now);
      const data = new Object();
      const count = 3;
      const axiosResponse = part<AxiosResponse>({ data, headers: { 'x-total-count': count } });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      const resetEntitiesSpy = jest.spyOn(store, 'resetEntities');
      store.lastUrl = '/api/entities?page=2&size=30&sort=name';
      const result = yield store.getAllFromLastUrl();
      expect(axiosMock.get).toBeCalledWith(`/api/entities?page=2&size=30&sort=name&cacheBuster=${now}`);
      expect(store.entities).toStrictEqual(data);
      expect(store.totalItems).toBe(count);
      expect(result).toBe(axiosResponse);
    });

    it('getAll should call getAllFromLastUrl', function* () {
      const data = new Object();
      store.getAllFromLastUrl = jest.fn().mockImplementationOnce(function* () {
        return yield Promise.resolve(data);
      });
      const result = yield* store.getAll(2, 30, 'name');
      expect(store.getAllFromLastUrl).toHaveBeenCalledTimes(1);
      expect(store.lastUrl).toBe('/api/entities?page=2&size=30&sort=name');
      expect(result).toBe(data);
    });

    it('getAll should call getAllFromLastUrl and user default url', function* () {
      const data = new Object();
      store.getAllFromLastUrl = jest.fn().mockImplementationOnce(function* () {
        return yield Promise.resolve(data);
      });
      const result = yield* store.getAll();
      expect(store.getAllFromLastUrl).toHaveBeenCalledTimes(1);
      expect(store.lastUrl).toBe('/api/entities');
      expect(result).toBe(data);
    });
  });
});
