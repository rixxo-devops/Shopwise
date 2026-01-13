const path = require("path")
const generate = require('magento-2-theme-tools')

module.exports = generate({
    dirname: __dirname,
    parent: path.dirname(require.resolve("@kingfisherdirect/magento2-theme-blank-coraciidae/package.json"))
})
