import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const CONFIG_VALIDATOR: ConfigModuleOptions = {
  validationSchema: Joi.object({
    DB_PORT: Joi.number().required(),
    DB_HOST: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_SCHEMA: Joi.string().required(),
    KAKAKO_API_KEY: Joi.string().required(),
  }),
  isGlobal: true,
  cache: true,
};
