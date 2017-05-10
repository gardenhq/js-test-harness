const filters = require("@gardenhq/willow/filters/");
const promised = require("@gardenhq/willow/util/promised");
module.exports = require("@gardenhq/willow")(
    // require("./conf/default.js")(),
    {},
    filters(promised(require))
);


