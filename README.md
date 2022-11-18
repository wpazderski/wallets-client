# wallets-client
A web application for secure management of investment information:
* wallets (groups of investments),
* investments (deposits, bonds, market investments, real estate and more),
* custom investment types,
* summaries - tables and charts (by wallet, by investment type, by currency, by industry and more),
* calculating investment values (based on interest or automatically obtained prices of stocks, ETFs, exchange rates etc.),
* multiple users can use single instance of the app (but it's not intended to be used by hundreds of users),
* investment information is end-to-end encrypted.

## Installation
```
git clone https://github.com/wpazderski/wallets-client.git
git clone https://github.com/wpazderski/wallets-server.git
cd wallets-client
npm ci
npm run build
cd ../wallets-server
npm ci
npm run build
```

## Configuration
Create configuration file `wallets-server/.env`. Example configuration:
```ini
KVAPI_DEV_MODE=0
KVAPI_DB_ENGINE=Level
KVAPI_PORT=17467
KVAPI_SSL_KEY_FILE_PATH=ssl-certs/cert.key
KVAPI_SSL_CRT_FILE_PATH=ssl-certs/cert.crt
KVAPI_API_BASE_URL=/api/
KVAPI_STATIC_BASE_URL=/
KVAPI_STATIC_PATH=../wallets-client/build/
KVAPI_PRIVATE_DB_MAX_NUM_ENTRIES=100000
KVAPI_PRIVATE_DB_MAX_SIZE=1G
KVAPI_VALUE_MAX_SIZE=8M
KVAPI_DISABLE_PUBLIC_ENTRIES=0
KVAPI_SESSION_MAX_INACTIVITY_TIME=1h
```
Put your SSL-related files in `ssl-certs/` directory (`cert.key` and `cert.crt` in the above configuration).

See [kvapi-server](https://github.com/wpazderski/kvapi-server) for more information about the `.env` file.

## Starting the app
```
cd wallets-server
npm start
```
However, it's recommended to use a service manager to start the app with the following command: `node ./build/main.js`.
