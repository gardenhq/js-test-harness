module.exports = function()
{
    var args = arguments;
    return function()
    {
        return args;
    }
}
