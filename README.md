# curation_platform

- [curation_platform](#curation_platform)
  - [Development](#development)
  - [Configuration](#configuration)
  - [Testing](#testing)
    - [Firebase Test](#firebase-test)
  - [Refactorings](#refactorings)
  - [Continuous Integration](#continuous-integration)

## Development

OncoKB Curation Platform is built with lots of great open source JS libraries. AngularJS is used as framework. Bower is used to manage denpendencies. Yeoman is used to initiate project and angular-generator is used to create angular directive/service/factory etc.

We use Google Firebase Realtime Database to store all information curators generated.

Install project

```
install npm
install yarn
yarn install
```

Tip: the version of node should be >= 14.15.0

## Configuration

Create an config file `.env` within root folder

```
# Firebase
REACT_APP_FIREBASE_API_KEY=""
REACT_APP_FIREBASE_AUTH_DOMAIN=""
REACT_APP_FIREBASE_DATABASE_URL=""
REACT_APP_FIREBASE_PROJECT_ID=""
REACT_APP_FIREBASE_STORAGE_BUCKET=""
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=""
REACT_APP_FIREBASE_APP_ID=""
REACT_APP_FIREBASE_MEASUREMENT_ID=""

# Endpoints
REACT_APP_ENDPOINT_CURATION_LINK="legacy-api/" // Your endpoints URL
REACT_APP_ENDPOINT_API_LINK="legacy-api/" // Your endpoints URL.
REACT_APP_ENDPOINT_INTERNAL_PRIVATE_API_LINK="api/private/" // Endpoints are specifically designed to use internally.
REACT_APP_ENDPOINT_PRIVATE_API_LINK="api/private/"
REACT_APP_ENDPOINT_PUBLIC_API_LINK="api/v1/"
REACT_APP_ENDPOINT_WEBSOCKET_API_LINK="api/websocket/"
REACT_APP_ENDPOINT_TESTING=false // If the testing is set to ture, all endpoints will be disabled and will use the files from web/yo/app/data folder.
REACT_APP_ENDPOINT_PRODUCTION=false // If the production is set to ture, all endpoints will be enabled and reviewed data will be updated to MySQL database.
```

**Tips**

It needs to be ran with oncokb-core. If you run locally, endpoint URLs need to be modified based on the URL of oncokb-core.

For example, if concokb-core runs at http://localhost:8888/oncokb, you should modify config as

```
  "REACT_APP_ENDPOINT_CURATION_LINK": "http://localhost:8888/oncokb/legacy-api/",
  "REACT_APP_ENDPOINT_API_LINK": "http://localhost:8888/oncokb/legacy-api/",
  "REACT_APP_ENDPOINT_INTERNAL_PRIVATE_API_LINK": "http://localhost:8888/oncokb/api/private/",
  "REACT_APP_ENDPOINT_PRIVATE_API_LINK": "http://localhost:8888/oncokb/api/private/",
  "REACT_APP_ENDPOINT_PUBLIC_API_LINK": "http://localhost:8888/oncokb/api/v1/",
  "REACT_APP_ENDPOINT_WEBSOCKET_API_LINK": "localhost:8888/oncokb/api/websocket/",

  ...
```

## Testing

### Firebase Test

We used [Jest][] and [Firebase Local Emulator Suite][] to implement this feature. The test can be executed locally or during CI process.

To execute this test locally, first you need to install Firebase Local Emulator Suite globally.

```
npm install -g firebase-tools
```

Then you should make sure there is an firebase.json file within root folder, which should include infomation:

```
{
  "functions": {
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ],
    "source": "functions"
  },
  "emulators": {
    "database": {
      "port": 9000
    },
    "ui": {
      "enabled": true
    }
  }
}
```

The you can start the emulator.

```
firebase emulators:start --only database --project [ProjectID] --import=./seed
```

The _ProjectID_ should be the local firebase emulator project ID. The default one in this repo is `firebase-local-test`.

`./seed` folder stores the mock data for local test.

At last, you can run the test by

```
yarn test-firebase
```

If you wanna modify the mock data of local emulator, there are two ways to change.

1. Modify the data file `firebase-local-test.json` under `./seed/database_export`
2. After start the emulator, you could visit a UI tool of mock database by `http://localhost:4000/database`. You can modify data there and export them by `firebase emulators:export ./seed`

## Refactorings

The structure of Users collection in Firebase has been changed. For example,

```
    "admin@testemail": {
      "role": "admin"
    },
```

The value of "role" has three options: admin, curator and user.

## Continuous Integration

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 7.0.0-beta.1 archive]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v7.0.0-beta.1/setting-up-ci/
[node.js]: https://nodejs.org/
[webpack]: https://webpack.github.io/
[angular cli]: https://cli.angular.io/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[protractor]: https://angular.github.io/protractor/
[leaflet]: https://leafletjs.com/
[definitelytyped]: https://definitelytyped.org/
[firebase local emulator suite]: https://firebase.google.com/docs/emulator-suite
