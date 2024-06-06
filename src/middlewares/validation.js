

const reqMethods = ['body', 'query', 'params', 'headers', 'file', 'files']


export const validationFunction = (schema) => {
    return (req, res, next) => {

        let validationErrorArr = []

        for (const key of reqMethods) {

            if (schema[key]) {
                const validationResult = schema[key].validate(req[key], { abortEarly: false })

                // In case there is any error fill validation array with it
                if (validationResult.error) {
                    validationErrorArr.push(validationResult.error.details)
                }
            }

        }

        // Here ,how to deal with validation errors 
        if (validationErrorArr.length) {


            req.validationErrorArr = validationErrorArr
            return next(new Error('', { cause: 400 }))
        }

        next()
    }
}