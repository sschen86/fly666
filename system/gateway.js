
const source = require('./gateway-source')

function error (message, code = -1, data = null) {
    const error = new Error('message')
    error.code = code
    error.data = data
    throw error
}

function response (data, etc) {
    return {
        response: { code: 1, data },
    }
}

module.exports = {
    source,
    error,
    exports: response,
}
