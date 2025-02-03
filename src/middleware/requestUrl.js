
const requestUrl = (req,res, next) => {
    console.log(req.originalUrl);
    next()
}

module.exports = requestUrl;