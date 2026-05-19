// @ts-rest/core is re-exported via @drs/contract's peer dep.
// We use plain fetch in the login component, so this file is a
// thin helper for future use with ts-rest's typed client.
// Uncomment the lines below once the contract is compiled:
//
// import { initClient } from '@ts-rest/core';
// import { authContract } from '@drs/contract';
// export const apiClient = initClient(authContract, {
//   baseUrl: '/api',
//   baseHeaders: { 'Content-Type': 'application/json' },
// });

export const API_BASE = '/api';

