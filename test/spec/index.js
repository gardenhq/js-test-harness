const chai = require("chai");
const td = require("testdouble");
const tdChai = require("testdouble-chai");
const expect = chai.expect;
chai.use(tdChai(td));
describe(
    'js-test-harness specs',
    function()
    {
        var factory = require("../../");

        context(
            ">",
            function()
            {
                const builder = {
                    use: td.when(td.function("use")(td.matchers.anything())),
                    load: td.when(td.function("load")(td.matchers.anything()))
                };
                const conf = td.when(td.function("conf")()).thenReturn({});
                builder.use = builder.use.thenReturn(builder);
                builder.load = builder.load.thenReturn(builder);
                it(
                    'has a use/load api',
                    function()
                    {
                        const container = factory(builder, conf);
                        // expect(builder.use).to.have.been.called;
                        expect(builder.load).to.have.been.calledWith(conf);

                        expect(container).to.be.an("object");
                        // console.log(container);
                    }
                );

            }
        );
    }
);
