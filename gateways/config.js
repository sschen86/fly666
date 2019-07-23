return {
    production: 'sgtest',
    development: 'sgtest',
    sources: {
        sgtest: {
            baseUrl: 'http://test2sop.sharegoodsmall.com/merchant-gw/',
            reqAdapter(reqOption) {
                return reqOption
            },
            resAdapter(responseData, ctx) {
                const responseDataCopyed = { ...responseData }
                responseDataCopyed.message = responseData.msg

                const { codes } = ctx
                const { code } = responseData

                switch (code) {
                    case 0:
                    case 10000:
                        responseDataCopyed.code = codes.SUCCESS
                        break
                    case 10010:
                        responseDataCopyed.code = codes.HTTP401
                        break
                    default:
                        responseDataCopyed.code = responseData.code
                }
                return responseDataCopyed
            },
        },
    },
}