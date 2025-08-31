import { getSaveEnv } from 'src/common';

export const getConfig = () => {
  return {
    node_env: getSaveEnv('NODE_ENV'),

    port: getSaveEnv('PORT'),

    jwt_access_secret: getSaveEnv('JWT_ACCESS_SECRET'),
    jwt_refresh_secret: getSaveEnv('JWT_REFRESH_SECRET'),
    jwt_access_expires: getSaveEnv('JWT_ACCESS_EXPIRES'),
    jwt_refresh_expires: getSaveEnv('JWT_EXPIRES_REFRESH'),
  };
};
