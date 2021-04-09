import { UserRole } from 'app/config/constants';

export interface IUser {
  name: string;
  email: string;
  photoURL: string;
  key: string;
  role: UserRole | undefined;
}

export const defaultValue: Readonly<IUser> = {
  name: '',
  email: '',
  photoURL: '',
  key: '',
  role: undefined,
};
