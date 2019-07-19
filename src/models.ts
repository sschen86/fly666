
import watch from 'node-watch'
import * as path from 'path'
import * as fs from 'fs'

const models = {}
const modelsDir = path.resolve('models') + '\\'

imports()

watch('models', { recursive: true, filter: /\.ts$/ }, function (e, name) {
    const modelName = path.basename(name, '.ts')
    const modelPath = modelsDir + path.basename(name)
    delete require.cache[modelPath]
    models[modelName] = require(modelPath).default
})

export default models


function imports() {
    const fileNames = fs.readdirSync(modelsDir)
    fileNames.forEach(name => {
        const modelName = path.basename(name, '.ts')
        const modelPath = modelsDir + name
        models[modelName] = require(modelPath).default
    })
}