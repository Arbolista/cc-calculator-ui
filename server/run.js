/* global process __dirname require*/
/* eslint import/no-dynamic-require: 0 */


import path from 'path';
import { argv } from 'yargs';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.APP_ID = '651280398386350';
if (process.env.NODE_ENV === 'development' && !argv.production_api) {
  process.env.API_BASE_URL = 'http://localhost:8082';
  process.env.COMPETITION_BASE_URL = 'http://localhost:9090/v1';
} else {
  process.env.API_BASE_URL = 'https://calculator.coolclimatenetwork.net';
  process.env.COMPETITION_BASE_URL = 'https://competition.coolclimatenetwork.net:9090/v1';
}

const envServerPath = path.join(__dirname, 'config', process.env.NODE_ENV.toLowerCase(), 'server');
const EnvServerClass = require(envServerPath).default;

const server = new EnvServerClass();

server.run();
