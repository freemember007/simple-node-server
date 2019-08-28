/**
 * knex配置信息
 *
 */

const knex = require('knex')({
  client: 'pg',
  connection: 'postgresql://localhost:5432/mydb',
})

module.exports = knex
