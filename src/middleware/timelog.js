const timeLog = (req, res, next) => {
    const currentDate = new Date();
    console.log(currentDate)
    next()
}

module.exports = timeLog;