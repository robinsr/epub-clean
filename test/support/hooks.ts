process.env.NODE_ENV = 'test';


global.__opts = { log_level: 1 }

export const mochaHooks = {
  beforeAll() {
    //console.log('process.env.NODE_ENV=', process.env.NODE_ENV);
  }
};