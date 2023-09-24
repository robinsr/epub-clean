import { consola } from 'consola';

export const mochaHooks = {
  beforeAll() {
    consola.level = -999;
    //consola.level = 4;
  }
};