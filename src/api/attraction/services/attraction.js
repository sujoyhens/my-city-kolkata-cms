'use strict';

/**
 * attraction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::attraction.attraction');
