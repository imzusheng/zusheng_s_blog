// log4js http://shenyujie.cc/2018/05/25/log4js-basic/, https://webfem.com/post/log4js_file
const log4js = require('log4js')
const path = require('path')
const routerLogFilename = path.resolve(__dirname, '../logs/routerLog')
const uncaughtLogFilename = path.resolve(__dirname, '../logs/uncaughtLog')
log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        // 用于配置输出的内容信息
        pattern: '%d{[yyyy/MM/dd-hh:mm:ss]} [%p] [%c] %m%n'
      }
    },
    router: {
      type: 'dateFile',
      filename: routerLogFilename,
      pattern: 'yyyy-MM-dd.log',
      encoding: 'utf-8',
      alwaysIncludePattern: true,
      daysToKeep: 100, // 保留天数
      layout: {
        type: 'pattern',
        // 用于配置输出的内容信息
        pattern: '%d{[yyyy/MM/dd-hh:mm:ss]} [%p] [%c] %m%n'
      }
    },
    uncaught: {
      type: 'dateFile',
      filename: uncaughtLogFilename,
      pattern: 'yyyy-MM-dd.log', // log 文件名后缀
      encoding: 'utf-8',
      alwaysIncludePattern: true, // log 文件名会包含之前设置的 pattern 信息
      daysToKeep: 100, // 保留天数
      layout: {
        type: 'pattern',
        pattern: '%d{[yyyy/MM/dd-hh:mm:ss]} [%p] [%c] %m%n' // 用于配置输出的内容信息
      }
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'all'
    },
    router: {
      appenders: ['router'],
      level: 'info'
    },
    uncaught: {
      appenders: ['uncaught'],
      level: 'info'
    }
  },
  replaceConsole: true
})
exports.loggerRouter = log4js.getLogger('router')
exports.loggerUncaught = log4js.getLogger('uncaught')
exports.loggerAll = log4js.getLogger('default')
// const logger = log4js.getLogger('console')
// console.log = logger.info.bind(logger)
