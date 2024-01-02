'use strict';

/**
 * healthcare service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::healthcare.healthcare');
