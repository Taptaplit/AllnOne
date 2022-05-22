class CacheInstance {
  constructor() {
    this.cache = []
  }

  get(key) {
    const object = this.cache.find(obj => obj.key == key)
    if (!object) return undefined
    return object.data
  }

  set(key, data, t) {
    this.cache.push({ key: key, data: data })
    return true
  }

  del(key) {
    const object = this.cache.findIndex(this.cache.find(obj => obj.key == key))
    this.cache.splice(object, 1);
  }

  task(delay) {
    setInterval(() => {
      this.cache = []
    }, delay)
  }
}

const myCache = new CacheInstance()
myCache.task(900000) //15 min

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

function setCache(key, obj) {
  const status = myCache.set(key, obj, 1800)
  return status
}

function getCache(key) {
  const val = myCache.get(key)
  return val
}

module.exports = {
  notFound,
  errorHandler,
  setCache,
  getCache
};
