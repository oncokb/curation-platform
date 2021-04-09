const config = {
  VERSION: process.env.VERSION,
};

export default config;

export const SERVER_API_URL = process.env.SERVER_API_URL;

export const FIREBASE_DEV_CONFIG = 'firebase-dev-config';

export const FIREBASE_TEST_CONFIG = 'firebase-test-config';

export const FIREBASE_LOCAL_TEST_ID = 'firebase-local-test';

export const firebaseConfig = {
  API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  DATABASE_URL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
  MEASUREMENT_ID: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export const endpointConfig = {
  CURATION_LINK: process.env.REACT_APP_ENDPOINT_CURATION_LINK,
  API_LINK: process.env.REACT_APP_ENDPOINT_API_LINK,
  INTERNAL_PRIVATE_API_LINK: process.env.REACT_APP_ENDPOINT_INTERNAL_PRIVATE_API_LINK,
  PRIVATE_API_LINK: process.env.REACT_APP_ENDPOINT_PRIVATE_API_LINK,
  PUBLIC_API_LINK: process.env.REACT_APP_ENDPOINT_PUBLIC_API_LINK,
  WEBSOCKET_API_LINK: process.env.REACT_APP_ENDPOINT_WEBSOCKET_API_LINK,
  TESTING: process.env.REACT_APP_ENDPOINT_TESTING,
  PRODUCTION: process.env.REACT_APP_ENDPOINT_PRODUCTION,
};

export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
};

export const messages = {
  DATA_ERROR_ALERT: 'Internal Error',
};

export const APP_DATE_FORMAT = 'DD/MM/YY HH:mm';
export const APP_TIMESTAMP_FORMAT = 'DD/MM/YY HH:mm:ss';
export const APP_LOCAL_DATE_FORMAT = 'DD/MM/YYYY';
export const APP_LOCAL_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';
export const APP_LOCAL_DATETIME_FORMAT_Z = 'YYYY-MM-DDTHH:mm Z';
export const APP_WHOLE_NUMBER_FORMAT = '0,0';
export const APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT = '0,0.[00]';

export const CURATION_PLATFORM_USER = 'curation-platform-user';

export const FIREBASE_DATA_SET_SUCCESSED = 'Set succeeded';
export const FIREBASE_DATA_SET_FAILED = 'Set failed';
export const FIREBASE_DATA_READ_FAILED = 'Read failed';
export const FIREBASE_DATA_UPDATE_SUCCESSED = 'Update succeeded';
export const FIREBASE_DATA_UPDATE_FAILED = 'Update failed';
export const FIREBASE_DATA_REMOVE_SUCCESSED = 'Remove successed';
export const FIREBASE_DATA_REMOVE_FAILED = 'Remove failed';

export const FIREBASE_COLLECTION_DRUG = 'Drugs/';
export const FIREBASE_COLLECTION_MAP = 'Map/';
export const FIREBASE_COLLECTION_SETTING = 'Setting/';
export const FIREBASE_COLLECTION_USERS = 'Users/';

export enum UserRole {
  ADMIN = 'admin',
  CURATOR = 'curator',
  USER = 'user',
}

export type UserDTO = {
  name: string;
  email: string;
  photoURL: string;
  key: string;
  role: UserRole | undefined;
};

export enum PAGE_ROUTE {
  WELCOME_PAGE = '/',
  LOGOUT = '/logout',
  GENES = '/genes',
  GENE = '/gene/',
  VARIANT = '/variant',
  TOOLS = '/tools',
  DRUGS = '/drugs',
  QUEUES = '/queues',
}

export interface Gene {
  background: string;
  background_review: Review;
  background_uuid: string;
  dmp_refseq_id: string;
  dmp_refseq_id_grch38: string;
  isoform_override: string;
  isoform_override_grch38: string;
  mutations: Mutation[];
  name: string;
  name_comments: Comment[];
  summary: string;
  summary_review: Review;
  summaty_uuid: string;
  type: GeneType;
  type_uuid: string;
}

export interface Mutation {
  mutation_effect: MutationEffect;
  mutation_effect_uuid: string;
  name: string;
  name_uuid: string;
  tumors: Tumor[];
}

export interface Review {
  updatedBy: string;
  updateTime: string;
}

export interface Comment {
  content: string;
  date: string;
  email: string;
  resolved: boolean;
  userName: string;
}

export interface GeneType {
  ocg: string;
  ocg_uuid: string;
  tsg: string;
  tsg_uuid: string;
}

export interface MutationEffect {
  description: string;
  description_review: Review;
  description_uuid: string;
  effect: string;
  effect_review: Review;
  effect_uuid: string;
  oncogenic: string;
  oncogenic_review: Review;
  oncogenic_uuid: string;
  short: string;
}

export interface Tumor {
  cancerTypes: CancerType[];
  cancerTypes_uuid: string;
  cancerTypes_review: Review;
  diagnostic: Diagnostic;
  diagnostic_uuid: string;
  diagnosticSummary: string;
  diagnosticSummary_review: Review;
  diagnosticSummary_uuid: string;
  prognostic: Prognostic;
  prognostic_uuid: string;
  prognosticSummary: string;
  prognosticSummary_review: Review;
  prognosticSummary_uuid: string;
  summary: string;
  summary_uuid: string;
  summary_review: Review;
  TIs: TI[];
}

export interface CancerType {
  code: string;
  mainType: string;
  subtype: string;
}

export interface Diagnostic {
  description: string;
  description_review: Review;
  description_uuid: string;
  level: string;
  level_review: Review;
  level_uuid: string;
  short: string;
}

export interface Prognostic {
  description: string;
  description_review: Review;
  description_uuid: string;
  level: string;
  level_review: Review;
  level_uuid: string;
  short: string;
}

export interface TI {
  name: string;
  name_uuid: string;
  treatments_uuid: string;
  type: string;
}
