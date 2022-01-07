const jwt = require('jsonwebtoken')
const { jwtOpt } = require('../config/config')

/**
 * 封装jwt token验证
 */
module.exports = {
  // 生成token
  getToken (flag) {
    const exp = Math.floor(Date.now() / 1000) + (60 * 60)  // + ... 秒, (60 * 60) 代表token有效期一小时
    return {
      exp,
      token: jwt.sign({
        // expiresIn: 1000,
        exp,
        data: `${flag}`
      }, jwtOpt.key)
    }
  },
  tokenVerify (ctx) {
    return new Promise(resolve => {
      const token = ctx.header.authorization
      jwt.verify(token, jwtOpt.key, {}, function (err, decoded) {
        if (err) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }
}
