import {
  FIREBASE_COLLECTION_DRUG,
  FIREBASE_COLLECTION_SETTING,
  FIREBASE_COLLECTION_USERS,
  FIREBASE_DATA_REMOVE_SUCCESSED,
  FIREBASE_DATA_SET_SUCCESSED,
  FIREBASE_DATA_UPDATE_SUCCESSED,
  FIREBASE_TEST_CONFIG,
} from 'app/config/constants';
import Firebase from '.';

const firebase = new Firebase(FIREBASE_TEST_CONFIG);

describe('firebase test', () => {
  test('Get all users', async () => {
    await firebase.getUsers().then((data: any) => {
      let size = 0;
      Object.keys(data).forEach(key => {
        size++;
      });
      expect(size).toBe(3);
    });
  });

  test('Get one specific user', async () => {
    await firebase.getUser('admin@testemail').then((data: any) => {
      expect(data.role).toBe('admin');
    });
  });

  test('update one specific user', async () => {
    const user = 'curator@testemail';
    const updatedRole = 'updated';
    await firebase.updateUser(user, updatedRole).then((message: any) => {
      expect(message).toBe(FIREBASE_DATA_UPDATE_SUCCESSED);
    });
    firebase.doOnce(`${FIREBASE_COLLECTION_USERS}${user}`, 'value').then(data => {
      expect(data.role).toBe(updatedRole);
    });
  });

  test('Add drug into Drugs Collections', async () => {
    const testUUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const newDrug = {
      description: 'A test drug 2',
      drugName: 'TestDrug',
      ncitCode: 'T00002',
      ncitName: 'TestDrug',
      priority: 2,
      synonyms: ['S-001', 'S-002', 'S-003', 'Mock'],
      uuid: testUUID,
    };
    await firebase.addDrug(testUUID, newDrug).then(message => {
      expect(message).toBe(FIREBASE_DATA_SET_SUCCESSED);
    });
    firebase.doOnce(`${FIREBASE_COLLECTION_DRUG}${testUUID}`, 'value').then(data => {
      expect(data.uuid).toBe(testUUID);
    });
  });

  test('Set drug name for specific drug', async () => {
    const UUID = '00000000-1111-2222-3333-444444444444';
    const newName = 'UpdatedName';
    await firebase.setDrugName(UUID, newName).then(message => {
      expect(message).toBe(FIREBASE_DATA_SET_SUCCESSED);
    });
    firebase.doOnce(`${FIREBASE_COLLECTION_DRUG}${UUID}`, 'value').then(data => {
      expect(data.drugName).toBe(newName);
    });
  });

  test('Remove specific drug', async () => {
    const UUID = '11111111-2222-3333-4444-555555555555';
    await firebase.removeDrug(UUID).then(message => {
      expect(message).toBe(FIREBASE_DATA_REMOVE_SUCCESSED);
    });
  });

  test('Add attribute in setting table', async () => {
    const attributeName = 'newAttribute';
    const attributeValue = 'newValue';
    await firebase.addAttributeInSetting(attributeName, attributeValue).then(message => {
      expect(message).toBe(FIREBASE_DATA_SET_SUCCESSED);
    });
    firebase.doOnce(`${FIREBASE_COLLECTION_SETTING}${attributeName}`, 'value').then(data => {
      expect(data).toBe(attributeValue);
    });
  });

  test('Remove attribute in setting table', async () => {
    await firebase.removeAttributeFromSetting('enableReview').then(message => {
      expect(message).toBe(FIREBASE_DATA_REMOVE_SUCCESSED);
    });
  });

  afterAll(() => {
    firebase.destory();
  });
});
