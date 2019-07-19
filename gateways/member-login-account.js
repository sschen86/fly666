return {
    mock: {
        method: 'post',
        async response(ctx, resolve, reject) {
            resolve({
                name: 'xxx',
            })
        },
    },
}