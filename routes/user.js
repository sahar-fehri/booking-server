const router = require('express').Router();
const verify = require('../verifyToken');

router.post('/book',verify, (req, res) => {
    console.log(req.user)
    res.json({
        posts: {
            title: 'ok'
        }
    })
})


module.exports = router;