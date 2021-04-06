const Joi = require('@hapi/joi');

//Regustration validation
const registerValidation = (data)=>{
    const schema = Joi.object ({
        name:  Joi.string().min(3).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        company: Joi.string().required()
    })
    return schema.validate(data);
}

const loginValidation = (data)=>{
    const schema = Joi.object ({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
