module.exports = {
    getJsonResponse : (status, errorcode, errortext, data, res) => {
        res.json({
            status      : status,
            errorcode   : errorcode,
            errortext   : errortext,
            data        : data,
        });
    },
}