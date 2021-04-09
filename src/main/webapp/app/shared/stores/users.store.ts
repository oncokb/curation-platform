import { FIREBASE_DATA_READ_FAILED, FIREBASE_DATA_UPDATE_FAILED, FIREBASE_DATA_UPDATE_SUCCESSED, UserDTO } from 'app/config/constants';
import _ from 'lodash';
import { makeAutoObservable } from 'mobx';
import Firebase from '../services/firebase';
import { notifyError } from '../util/notification.util';
import RootStore from './root.store';

export default class UsersStore {
  private readonly rootStore: RootStore;
  private readonly firebase: Firebase;
  allUsers = {};

  constructor(rootStore: RootStore, firebase: Firebase) {
    this.rootStore = rootStore;
    this.firebase = firebase;
    makeAutoObservable(this);
  }

  getAllUsers(): Promise<any> {
    if (_.isEmpty(this.allUsers)) {
      return new Promise((resolve, reject) => {
        this.firebase
          .getUsers()
          .then(users => {
            this.allUsers = users;
            resolve(users);
          })
          .catch((error: Error) => {
            notifyError(new Error(FIREBASE_DATA_READ_FAILED));
            reject(error);
          });
      });
    } else return Promise.resolve(this.allUsers);
  }
}
