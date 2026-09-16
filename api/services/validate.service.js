const {validationResult} = require('express-validator')

module.exports = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        let _errors = {}

        errors.array().forEach(v => {
            if (typeof _errors[v.param] !== 'undefined') {
                _errors[v.param].push(v.msg)
            } else {
                _errors[v.param] = [v.msg]
            }
        })

        res
            .status(422)
            .json({
                success: false,
                message: 'Unprocessable Entity',
                errors: _errors
            });
    };
};