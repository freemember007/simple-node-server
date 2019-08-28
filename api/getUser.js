/**
 * 获取用户接口
 * @param {String} id 用户id
 *
 * curl localhost:3000/getUser -d '{"username:"xjp", "password": "1234"}'
 */
const knex = require('../config/knex')
const ensure = require('../utils/ensure')

module.exports = async ({ body: { id } }) => {
  ensure(id, 'id不能为空')

  const user = await knex('user')
    .where({ id })
    .first()

  if (!user) return { code: 'P0001', msg: '帐号或密码错误' }

  return { user }
}
