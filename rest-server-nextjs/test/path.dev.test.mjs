import { describe } from "mocha";
import { expect } from "chai";
import {
  createPath,
  createPathParamValueFunction,
  escapeRegExp,
} from "../src/path.mjs";

describe("escapeLiteral", () => {
  it("Empty string", () => {
    const tested = "";
    const expected = "";
    const result = escapeRegExp(tested);
    expect(result).to.equal(expected);
  });
  const valid = [
    ["abba", "abba"],
    [".Zoomer", "\\.Zoomer"],
    ["talos.Palos", "talos\\.Palos"],
    ["(?<never>\\w+)", "\\(\\?<never>\\\\w\\+\\)"],
  ];
  valid.forEach(([tested, expected], index) => {
    it(`Test #${index}: Litearal ${tested}`, () => {
      const result = escapeRegExp(tested);
      expect(result).to.equal(expected);
      expect(() => {
        const re = RegExp("^" + result + "$");
      }).to.not.throw();
      const re = new RegExp("^" + result + "$");
      expect(re.test(tested)).to.true;
    });
  });
});

describe("Unit Test of Path", () => {
  describe("createPath", () => {
    it("Literal path /test/rest", () => {
      const segments = ["test", "rest"];
      const result = createPath(...segments);
      expect(result.segments).eql([...segments]);
      expect(result.parameters).to.be.empty;
      expect(result.regex.source).to.equal(
        escapeRegExp("/" + segments.join("/"))
        + "(?=\\/|$)"
        );

      const testPath = "/test/rest";
      let match;
      expect(() => {match = result.regex.exec(testPath)}).not.throw();
      expect(match).not.null;
      expect(match.index).to.equal(0);
      expect(match[0]).to.equal(testPath);
    });
    it("Literal path /testrest", () => {
      const segments = ["test", "rest"];
      const result = createPath(segments);
      expect(result.segments).eql([segments]);
      expect(result.parameters).to.be.empty;
      expect(result.regex?.source).to.equal(
        escapeRegExp("/" + segments.join(""))
        + "(?=\\/|$)"
        );

      const testPath = "/testrest";
      let match;
      expect(() => {match = result.regex.exec(testPath)}).not.throw();
      expect(match).not.null;
      expect(match.index).to.equal(0);
      expect(match[0]).to.equal(testPath);
    });
    it("Parameter path /test/[param]", () => {
      const segments = [
        "test",
        {
          type: "parameter",
          paramName: "param",
          parser: (str) => str,
          toString: (value) => escapeRegExp(value),
        },
      ];
      const result = createPath(...segments);
      const expectedPathParam = {
        type: segments[1].type,
        paramName: segments[1].paramName,
        value: createPathParamValueFunction(
          segments[1].paramName,
          segments[1].parser
        ),
      };
      expect(result.segments).eql([...segments]);
      expect(result.parameters[segments[1].paramName].value.toString()).eql(
        expectedPathParam.value.toString()
      );
      expect(result.regex?.source).to.equal(
        escapeRegExp("/" + segments[0] + "/") +
          `(?<${segments[1].paramName}>[^\\\/]+?)`
          + "(?=\\/|$)"
      );

      const testPath = "/test/rest";
      let match;
      expect(() => {match = result.regex.exec(testPath)}).not.throw();
      expect(match).not.null;
      expect(match.index).to.equal(0);
      expect(match[0]).to.equal(testPath);
      expect(result.parameters[segments[1].paramName].value(match)).to.equal("rest");

    });

    it("Parameter path /test/[eventId]/generate/[eventId]", () => {
      const segments = [
        "test",
        {
          type: "parameter",
          paramName: "eventId",
          parser: (str) => str,
          toString: (value) => escapeRegExp(value),
        },
        "generate",
        {
          type: "parameter",
          paramName: "eventId",
          parser: (str) => str,
          toString: (value) => escapeRegExp(value),
        },
      ];
      const result = createPath(...segments);
      const expectedPathParam = {
        type: segments[1].type,
        paramName: segments[1].paramName,
        value: createPathParamValueFunction(
          segments[1].paramName,
          segments[1].parser
        ),
      };
      expect(result.segments).eql([...segments]);
      expect(result.parameters[segments[1].paramName].value.toString()).eql(
        expectedPathParam.value.toString()
      );
      expect(result.regex?.source).to.equal(
        escapeRegExp("/" + segments[0] + "/") +
          `(?<${segments[1].paramName}>[^\\\/]+?)` +
          escapeRegExp("/" + segments[2]) +
          `\\/\\k<${result.segments[3].paramName}>`
          + "(?=\\/|$)"
      );
    });
  });

  it.skip("", () => {});
});
