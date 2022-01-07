const { MongoClient } = require('mongodb') // const MongoClient = require('mongodb').MongoClient;
const path = require('path')
const filePath = path.resolve(__dirname, __filename)
const { errorHandle } = require('../util')
// db.createCollection('articles', function (err, res) {
//   if (err) throw err
// })
// db.listCollections().toArray(function (err, result) {
//   if (err) throw err
// })
// function reset (db) {
//   db.dropDatabase()
//   db.collection('user').insertOne({
//     uid: 'imzusheng@163.com',
//     pwd: 'lzs6290993'
//   })
// }
// https://juejin.cn/post/6961387763283263496#heading-24 账户权限配置
module.exports = class MongoDB {
  constructor (config) {
    console.log('-- mongodb.js -- 传入配置')
    this.config = config
    this.connetDB().then() // db => reset(db)
  }

  connetDB () {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        MongoClient.connect(this.config.mongodb.url, (err, client) => {
          if (err) {
            reject(err)
          } else {
            console.log('-- mongodb.js -- 连接成功')
            this.db = client.db(this.config.mongodb.dbName)
            resolve(this.db)
          }
        })
      } else {
        resolve(this.db)
      }
    })
  }

  // 通用查询
  queryData (collectionName, queryParams, sort, ctx) {
    const s = sort || {}
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.collection(collectionName).find(queryParams).sort(s).toArray((error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'queryData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 管道，高级查询
  aggregateData (collectionName, queryParamsArray, ctx) {
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.collection(collectionName).aggregate(queryParamsArray).toArray((error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'aggregateData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 修改
  updateOneData (collectionName, queryParams, newData, option, ctx) {
    return new Promise((resolve, reject) => {
      this.connetDB().then(db => {
        db.collection(collectionName).updateOne(queryParams, newData, option, (error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'updateOneData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 修改多条
  updateManyData (collectionName, queryParams, newData, option, ctx) {
    return new Promise((resolve, reject) => {
      this.connetDB().then(db => {
        db.collection(collectionName).updateMany(queryParams, newData, option, (error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'updateManyData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 删除一条
  deleteOneData (collectionName, queryParams, ctx) {
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.collection(collectionName).deleteOne(queryParams, (error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'deleteOneData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 插入一条
  insertOneData (collectionName, data, ctx) {
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.collection(collectionName).insertOne(data, (error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'insertOneData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 插入多条
  insertManyData (collectionName, data, ctx) {
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.collection(collectionName).insertMany(data, (error, result) => {
          resolve({
            error: error ? errorHandle(error, filePath, 'insertOneData', ctx) : null,
            result // 插入新数据时返回_id
          })
        })
      })
    })
  }

  // 重置数据库
  resetDataBase (ctx) {
    return new Promise(resolve => {
      this.connetDB().then(db => {
        db.dropDatabase((error) => {
          resolve({
            error: error,
            result: null
          })
        })
      })
    })
  }
}
