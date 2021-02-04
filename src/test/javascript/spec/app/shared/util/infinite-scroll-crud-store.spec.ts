import axios, { AxiosResponse } from 'axios';
import { part } from '../../utils';
import InfiniteScrollCrudStore from 'app/shared/util/infinite-scroll-crud-store';
import * as reactJhipster from 'react-jhipster';

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;

jest.mock('react-jhipster');
const reactJhipsterMock = reactJhipster as jest.Mocked<typeof reactJhipster>;

describe('Infinite scroll crud store tests', () => {
  const apiUrl = '/api/entities';

  describe('Actions', () => {
    let store;

    beforeEach(() => {
      store = new InfiniteScrollCrudStore(null, apiUrl);
      jest.clearAllMocks();
    });

    it('getAllFromLastUrl should get and resetEntities', function* () {
      const data = new Object();
      const link = new Object();
      const parseHeaderForLinksResult = new Object();
      const loadMoreDataWhenScrolledResult = new Object();
      const count = 3;
      const axiosResponse = part<AxiosResponse>({ data, headers: { 'x-total-count': count, link } });
      axiosMock.get.mockResolvedValueOnce(axiosResponse);
      reactJhipsterMock.parseHeaderForLinks.mockReturnValueOnce(parseHeaderForLinksResult);
      reactJhipsterMock.loadMoreDataWhenScrolled.mockReturnValueOnce(loadMoreDataWhenScrolledResult);
      const resetEntitiesSpy = jest.spyOn(store, 'resetEntities');
      store.lastUrl = '/api/entities?page=1&size=10&sort=id';

      const result = yield store.getAllFromLastUrl();

      expect(axiosMock.get).toBeCalledWith(store.lastUrl);
      expect(reactJhipsterMock.parseHeaderForLinks).toBeCalledWith(link);
      expect(reactJhipsterMock.loadMoreDataWhenScrolled).toBeCalledWith([], data, parseHeaderForLinksResult);
      expect(store.entities).toStrictEqual(loadMoreDataWhenScrolledResult);
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
