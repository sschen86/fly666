
const allSources = {}
function defines (name, option) {
    if (typeof name === 'object') {
        const defines = name
        for (const name in defines) {
            defines(name, defines[name])
        }
        return
    }
    allSources[name] = option
}

let currentName = null
function focus (name) {
    currentName = name
    return allSources[currentName]
}

module.exports = {
    defines, focus,
}
