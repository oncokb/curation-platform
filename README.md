# OncoKB Curation Platform

OncoKB Curation Platform is built with lots of great open source JS libraries. AngularJS is used as framework. Bower is used to manage denpendencies. Yeoman is used to initiate project and angular-generator is used to create angular directive/service/factory etc. 

We use Google Firebase Realtime Database to store all information curators generated.

## Install project
1. Install npm & & yarn & grunt-cli (globally)
2. yarn install

## config.json setting
File is located under /app/data
```
{
    "curationLink": "legacy-api/",  // Your endpoints URL specifically designed for curation platform.
    "apiLink": "legacy-api/",   // Your endpoints URL.
    "internalPrivateApiLink": "api/private/",
    "privateApiLink": "api/private/",   // Endpoints are specifically designed to use internally.
    "publicApiLink": "api/v1/",
    "websocketApiLink": "api/websocket/",
    "testing": false,   // If the testing is set to ture, all endpoints will be disabled and will use the files from web/yo/app/data folder.
    "production": false,    // If the production is set to ture, all endpoints will be enabled and reviewed data will be updated to MySQL database.
    
    // Click "Settings" button in Dev Oncokb Curation Firebase Console and choose project settings. Under General tab you will find Firebase SDK snippet section which has this config
    "firebaseConfig": {  
        "apiKey": "",
        "authDomain": "",
        "databaseURL": "",
        "projectId": "",
        "storageBucket": "",
        "messagingSenderId": "",
        "appId": ""
    }
}
```

#### Tips
It needs to be ran with oncokb-core. If you run locally, endpoint URLs need to be modified based on the URL of oncokb-core.

For example, if concokb-core runs at `http://localhost:8888/oncokb`, you should modify config as
```
    "curationLink": "http://localhost:8888/oncokb/legacy-api/",  
    "apiLink": "http://localhost:8888/oncokb/legacy-api/",   
    "internalPrivateApiLink": "http://localhost:8888/oncokb/api/private/",
    "privateApiLink": "http://localhost:8888/oncokb/api/private/",
    "publicApiLink": "http://localhost:8888/oncokb/api/v1/",
    "websocketApiLink": "localhost:8888/oncokb/api/websocket/",

    ...
```

## Testing
For front-end, we use Karma and Jasmin to run unit test cases.
1. Install karma-cli (globally).
2. Copy /app/data/config.json to **OncoKB.config** in /app/scripts/app.spec.js.
3. Run **karma start** at root folder.

## FAQs      
#### Can’t getAllUsers() because of the different rules set in Firebase. It still shows 'don’t have access...' after logging in successfully.         
   Add rules to the database.     

License
--------------------

OncoKB free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License, version 3, as published by the Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

A public instance of OncoKB (https://oncokb.org) is hosted and maintained by Memorial Sloan Kettering Cancer Center. It provides access to all curators in MSKCC knowledgebase team.

If you are interested in coordinating the development of new features, please contact contact@oncokb.org.
