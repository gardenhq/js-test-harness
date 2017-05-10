module.exports = function(builder, conf)
{ 
    // const mocha = require("mocha");
    // console.log(Object.keys(mocha.Suite))
    //this won't work is there a way to get the current test file
    // directory from mocha?
    builder = builder || require("../builder.js");
    conf = conf || require("./conf/")();
    builder.replace = function(key, value)
    {
        this.set(
            key,
            function()
            {
                return this.get(value)
            }.bind(this)
        );
    }

    return builder.load(
        conf
    );
};



