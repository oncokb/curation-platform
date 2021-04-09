import {
  FIREBASE_DATA_REMOVE_SUCCESSED,
  FIREBASE_DATA_SET_SUCCESSED,
  FIREBASE_DATA_UPDATE_SUCCESSED,
  FIREBASE_COLLECTION_DRUG,
  FIREBASE_COLLECTION_MAP,
  FIREBASE_COLLECTION_SETTING,
  FIREBASE_COLLECTION_USERS,
  firebaseConfig,
  FIREBASE_DEV_CONFIG,
  FIREBASE_LOCAL_TEST_ID,
} from 'app/config/constants';
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: firebaseConfig.API_KEY,
  authDomain: firebaseConfig.AUTH_DOMAIN,
  databaseURL: firebaseConfig.DATABASE_URL,
  projectId: firebaseConfig.PROJECT_ID,
  storageBucket: firebaseConfig.STORAGE_BUCKET,
  messagingSenderId: firebaseConfig.MESSAGING_SENDER_ID,
  appId: firebaseConfig.APP_ID,
  measurementId: firebaseConfig.MEASUREMENT_ID,
};

const test_config = {
  projectId: FIREBASE_LOCAL_TEST_ID,
  databaseURL: 'http://localhost:9000/?ns=firebase-local-test',
};

/**
 * @description Implemented Firebase services, including authentication APIs and database APIs.
 * @author Yifu Yao
 * @date 02/19/2021
 * @export
 * @class Firebase
 */
export default class Firebase {
  public auth: any;
  private db: any;
  private googleProvider: any;

  constructor(environment: string) {
    if (environment === FIREBASE_DEV_CONFIG) {
      app.initializeApp(config);
      this.auth = app.auth();
      this.googleProvider = new app.auth.GoogleAuthProvider();
    } else {
      app.initializeApp(test_config);
    }
    this.db = app.database();
  }

  destory(): void {
    app.app().delete();
  }

  /** Auth API */
  /**
   * @description Sign in with google account
   * @returns {*}  {Promise< firebase.default.auth.UserCredential>}
   * @memberof Firebase
   */
  doSignInWithGoogle(): Promise<firebase.default.auth.UserCredential> {
    return this.auth.signInWithPopup(this.googleProvider);
  }

  /**
   * @description Sign out
   * @memberof Firebase
   */
  doSignOut(): void {
    this.auth.signOut();
  }

  /** Database APIs */
  /**
   * @description Reference the root or child location in Database
   * @param {string} path
   * @returns {*}  {firebase.default.database.Reference}
   * @memberof Firebase
   */
  doRef(path: string): firebase.default.database.Reference {
    return this.db.ref(path);
  }

  /**
   * @description Do on() method of database reference
   * @param {string} path
   * @param {firebase.default.database.EventType} eventType
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  doOn(path: string, eventType: firebase.default.database.EventType): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doRef(path).on(
        eventType,
        (snapshot: firebase.default.database.DataSnapshot) => {
          resolve(snapshot.val());
        },
        (error: Error) => {
          reject(error);
        }
      );
    });
    return promise;
  }

  /**
   * @description Do off() method of database reference
   * @param {string} path
   * @memberof Firebase
   */
  doOff(path: string): void {
    this.doRef(path).off();
  }

  /**
   * @description Do once() method of database reference
   * @param {string} path
   * @param {firebase.default.database.EventType} eventType
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  doOnce(path: string, eventType: firebase.default.database.EventType): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doRef(path)
        .once(eventType)
        .then((snapshot: firebase.default.database.DataSnapshot) => {
          resolve(snapshot.val());
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /**
   * @description Do set() method of database reference
   * @param {string} path
   * @param {*} data
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  doSet(path: string, data: any): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doRef(path)
        .set(data)
        .then(() => {
          resolve(FIREBASE_DATA_SET_SUCCESSED);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /**
   * @description Do remove() method of database reference
   * @param {string} path
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  doRemove(path: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doRef(path)
        .remove()
        .then(() => {
          resolve(FIREBASE_DATA_REMOVE_SUCCESSED);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /**
   * @description Do update() method of database reference
   * @param {string} path
   * @param {*} data
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  doUpdate(path: string, data: any): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doRef(path)
        .update(data)
        .then(() => {
          resolve(FIREBASE_DATA_UPDATE_SUCCESSED);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /** Users API */
  /**
   * @description Get all users
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  getUsers(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doOnce(FIREBASE_COLLECTION_USERS, 'value')
        .then(users => {
          resolve(users);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /**
   * @description Get one specific user
   * @param {string} path
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  getUser(path: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.doOnce(`${FIREBASE_COLLECTION_USERS}${path}`, 'value')
        .then(user => {
          resolve(user);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /**
   * @description update one specific user
   * @param {*} user
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  updateUser(user: string, newRole: string): Promise<any> {
    const info = {
      role: newRole,
    };
    const promise = new Promise((resolve, reject) => {
      this.doUpdate(`${FIREBASE_COLLECTION_USERS}${user}`, info)
        .then(() => {
          resolve(FIREBASE_DATA_UPDATE_SUCCESSED);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
    return promise;
  }

  /** Drugs API */
  /**
   * @description Add drug into Drugs Collections
   * @param {string} uuid
   * @param {*} drug
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  addDrug(uuid: string, drug: any): Promise<any> {
    return this.doSet(`${FIREBASE_COLLECTION_DRUG}${uuid}`, drug);
  }

  /**
   * @description Set drug name for specific drug
   * @param {string} uuid
   * @param {string} drugName
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  setDrugName(uuid: string, drugName: string): Promise<any> {
    return this.doSet(`${FIREBASE_COLLECTION_DRUG}${uuid}/drugName`, drugName);
  }

  /**
   * @description Remove specific drug
   * @param {string} uuid
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  removeDrug(uuid: string): Promise<any> {
    return this.doRemove(`${FIREBASE_COLLECTION_DRUG}${uuid}`);
  }

  /**
   * @description Add treatment
   * @param {string} path
   * @param {*} treatment
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  addTreatment(path: string, treatment: any): Promise<any> {
    return this.doSet(`${path}/treatments/0`, treatment);
  }

  /** Map API */
  /**
   * @description Do once() method in Map Table
   * @param {string} path
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  mapOnce(path: string): Promise<any> {
    return this.doOnce(`${FIREBASE_COLLECTION_MAP}${path}`, 'value');
  }

  /**
   * @description Set map
   * @param {string} path
   * @param {*} name
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  setMap(path: string, name: any): Promise<any> {
    return this.doSet(`${FIREBASE_COLLECTION_MAP}${path}`, name);
  }

  /**
   * @description Remove map
   * @param {string} path
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  removeMap(path: string): Promise<any> {
    return this.doRemove(`${FIREBASE_COLLECTION_MAP}${path}`);
  }

  /** Setting API */
  /**
   * @description Create setting
   * @param {*} setting
   * @memberof Firebase
   */
  createSetting = (setting: any): Promise<any> => {
    return this.doSet(FIREBASE_COLLECTION_SETTING, setting);
  };

  /**
   * @description Add attribute in setting table
   * @param {string} path
   * @param {*} attribute
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  addAttributeInSetting(path: string, attribute: any): Promise<any> {
    return this.doSet(`${FIREBASE_COLLECTION_SETTING}${path}`, attribute);
  }

  /**
   * @description Remove attribute in setting table
   * @param {string} path
   * @returns {*}  {Promise<any>}
   * @memberof Firebase
   */
  removeAttributeFromSetting(path: string): Promise<any> {
    return this.doRemove(`${FIREBASE_COLLECTION_SETTING}${path}`);
  }
}
