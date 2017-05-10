module.exports = function(builder)
{
    return {
        "marky": {
            "object": "marky"
        },
        "chai": {
            "object": "chai"
        },
        "testdouble": {
            "object": "testdouble"
        },
        "testdouble.chai": {
            "object": "testdouble-chai"
        },
        "test.match": {
            "resolve": [
                "@testdouble"
            ],
            "service": function(td)
            {
                return td.matchers;
            }
        },
        "test.expect": {
            "resolve": [
                "@chai",
                "@testdouble",
                "@testdouble.chai"
            ],
            "service": function(chai, td, tdChai)
            {
                chai.use(tdChai(td));
                chai.use(
                    function(chai, utils)
                    {
                        utils.addProperty(
                            chai.Assertion.prototype,
                            "times",
                            function()
                            {
                                console.log("boo"); 
                            }
                        );
                        utils.addMethod(
                            chai.Assertion.prototype,
                            "calledTimes",
                            function(times)
                            {
                                td.verify(this._obj.apply(
                                    this._obj,
                                    [
                                    ]
                                ), {ignoreExtraArgs: true, times: times});
                            }
                        );
                    }
                );
                return chai.expect;
            }
        },
        "test.calledWith": {
            "resolve": [
                "@testdouble"
            ],
            "service": function(td)
            {
                return function(arr, name)
                {
                    arr = arr || [];
                    if(!Array.isArray(arr)) {
                        throw new TypeError("calledWith expects an array of arguments [td.matchers.anything()], not a single value");
                    }
                    const func = td.function(name);
                    const method = td.when(func.apply(td, arr));
                    return {
                        returns: function(obj)
                        {
                            return method.thenReturn(obj);
                        },
                        resolvesWith: function(obj)
                        {
                            return method.thenResolve(obj);
                        },
                        rejectsWith: function(obj)
                        {
                            return method.thenReject(obj);
                        },
                        throws: function(obj)
                        {
                            return method.thenThrow(obj);
                        },
                        callsback: function()
                        {
                            return method.thenCallback.apply(null, arguments);
                        },
                        after: function(ms)
                        {
                            return this;
                        }
                    };
                }
            }
        },
        "test.metrics": {
            "resolve":[
                "@marky"
            ],
            "service": function(marky)
            {
                const yellow = "\x1b[33m";
                const grey = "\x1b[90m";
                const end = "\x1b[0m";
                return {
                    start: function(title)
                    {
                        return marky.mark(title);
                    },
                    _results: [],
                    aggregate: function(title)
                    {
                        this._results = [];
                    },
                    average: function()
                    {
                        const total = this._results.reduce(
                            function(prev, item)
                            {
                                return prev + item
                            }
                        );
                        const avg = (total / this._results.length);
                        const str = `      ${yellow}\u21E5${end} (total: ${total.toPrecision(3) }ms avg: ${avg.toPrecision(3)}ms)`;
                        console.log(str);
                    },
                    report: function(result)
                    {
                        const str = `      ${yellow}\u21E5${end} (!${result.startTime.toPrecision(3)}ms > ${result.duration.toPrecision(3)}ms)`;
                        console.log(str);
                    },
                    stop: function(title)
                    {
                        const result = marky.stop(title);
                        // title = title.replace(' ', '\\ ');
                        title = "title";
                        const package = "package";
                        const version = "0.1.0";
                        const statsd = "test.duration,project=" + package + ",type=js,name=" + title + ",version=" + version + ":" + result.duration + "|ms";
                        // this.statsd(statsd);
                        // console.log(result);
                        this.report(result);
                        this._results.push(result.duration);
                        return result;
                    }
                };
            }
        },
        "test.builder": builder,
        "test.loader": {
            "service": function()
            {
                return function()
                {
                    const localModules = {
                        "test.expect": "expect",
                        "test.metrics": "metrics",
                        "testdouble": "td",
                        "test.builder": "builder"
                    };

                    const modules = [].slice.call(arguments);
                    return Promise.all(
                        Object.keys(localModules).concat(modules).map(
                            function(item)
                            {
                                return builder.get(item);
                            }
                        )
                    ).then(
                        function(loaded)
                        {
                            const obj = {};
                            const keys = Object.keys(localModules);
                            const len = keys.length;
                            keys.forEach(
                                function(item, i)
                                {
                                    obj[localModules[item]] = loaded[i]
                                }
                            );
                            modules.forEach(
                                function(item, i)
                                {
                                    obj[item] = loaded[len + i]
                                }
                            );
                            return obj;
                        }
                    )
                }
            }
        }
    };
}
