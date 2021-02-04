import { AxiosResponse } from 'axios';

export type IPayload<T> = Promise<AxiosResponse<T>>;

export type ICrudGetAction<T> = (id: string | number) => IPayload<T>;
export type ICrudGetAllAction<T> = (page?: number, size?: number, sort?: string) => IPayload<T[]>;
export type ICrudSearchAction<T> = (search?: string, page?: number, size?: number, sort?: string) => IPayload<T[]>;
export type ICrudDeleteAction<T> = (id?: string | number) => IPayload<T>;
export type ICrudPutAction<T> = (data?: T) => IPayload<T>;
