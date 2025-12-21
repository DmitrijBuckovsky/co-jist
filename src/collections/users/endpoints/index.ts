import { changePasswordHandler } from './change-password.handler';
import { Endpoint } from 'payload';

export const changePassword: Endpoint = {
  method: 'post',
  handler: changePasswordHandler,
  path: '/change-password',
};
