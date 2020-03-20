import dotenv from 'dotenv';
import path from 'path';
import Joi from '@hapi/joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(9000),
    MONGODB_URL: Joi.string()
      .required()
      .description('Mongo DB url'),
    SEED_DB: Joi.required().description('Seed Database'),
    JWT_SECRET: Joi.string()
      .required()
      .description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_DEVICE_ACCESS_EXPIRATION_DAYS: Joi.number()
      .default(18250)
      .description('days after which device access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    DEFAULT_ADMIN_EMAIL: Joi.string()
      .required()
      .description('default email of admin'),
    DEFAULT_ADMIN_PASS: Joi.string()
      .required()
      .description('default password of admin'),
    DEFAULT_ADMIN_NAME: Joi.string()
      .required()
      .description('default name of admin'),
    DEFAULT_ADMIN_ROLE: Joi.string()
      .required()
      .description('default role of admin'),
    DEFAULT_SUB_DEVICE_AUTOSHUTDOWN_TIME: Joi.number()
      .default(30) // mins
      .description('days after which refresh tokens expire'),
    DEFAULT_TANK_WATER_LEVEL_TO_START: Joi.number()
      .default(70) // percent
      .description('days after which refresh tokens expire'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true },
  },
  seedDB: envVars.SEED_DB,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    deviceAccessExpirationDays: envVars.JWT_DEVICE_ACCESS_EXPIRATION_DAYS,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 10,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  defaultAdmin: {
    name: envVars.DEFAULT_ADMIN_NAME,
    email: envVars.DEFAULT_ADMIN_EMAIL,
    password: envVars.DEFAULT_ADMIN_PASS,
    role: envVars.DEFAULT_ADMIN_ROLE,
  },
  defaultSettings: {
    defaultSubDeviceAutoShutDownTime: envVars.DEFAULT_SUB_DEVICE_AUTOSHUTDOWN_TIME,
    defaultTankWaterLevelToStart: envVars.DEFAULT_TANK_WATER_LEVEL_TO_START,
  },
};
