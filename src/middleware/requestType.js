const requestMethod = ((req, res, next) => {
    console.log('request Type', req.method);
    next()
})

module.exports = requestMethod;