import { describe } from "mocha";
import { AssertionError, expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  createPath,
  createPathParamValueFunction,
  escapeRegExp,
} from "../src/path.mjs";

use(chaiAsPromised);

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

/**
 * @template [TYPE=string] The paramter values.
 * @typedef {Object} SegmentPathTestData
 * @property {string} path The tested path.
 * @property {Object.<string, TYPE?>} [params] The mapping from parameter names
 * to expected parameter values. If params is not given, the case is expected
 * to fail.
 * @description The test data.
 */

/**
 * Test segment path results.
 * @param {import("../src/path.mjs").ServicePath} tested The tested segment path.
 * @param {SegmentPathTestData<any>[]} [validPaths] The valid paths.
 * @param {SegmentPathTestData<any>[]} [invalidPaths] The invalid paths.
 * @param {boolean} [testCase=false] Does the test create describe and it.
 * @returns {Promise<boolean>} True, if the test passes. False, if the test is
 * skipped. Rejection with error if test fails.
 * @throws {import("chai").AssertionError} The exception of the rejection, if test fails.
 */
function testSegmentPath(
  tested,
  validPaths = [],
  invalidPaths = [],
  testCase = false
) {
  return new Promise((resolve, reject) => {
    expect(tested).to.instanceOf(Object);
    try {
      if (testCase) {
        describe("Valid segment paths", () => {
          validPaths.forEach(({ path, params }, index) => {
            expect(params).instanceOf(
              Object,
              `Invalid valid test data at index ${index}`
            );
            it(`Test #${index}: ${path}`, () => {
              let match;
              const regexp = new RegExp(
                tested.regex.source,
                tested.regex.flags
              );
              expect(() => {
                match = regexp.exec(path);
              }).to.not.throw();
              expect(match).not.null;
              Object.getOwnPropertyNames(params).forEach((paramName) => {
                expect(tested.parameters[paramName]).instanceOf(Object);
                expect(tested.parameters[paramName].value(match)).to.equal(
                  params[paramName]
                );
              });
            });
          });
        });
        describe("Invalid segment paths", () => {
          if (params) {
            throw AssertionError(
              `Invalid test case at ${index} contains parameters`
            );
          }
          it(`Test #${index}: ${path}`, () => {
            let match;
            const regexp = new RegExp(tested.regex.source, tested.regex.flags);
            expect(() => {
              match = regexp.exec(path);
            }).to.not.throw();
            expect(match).null;
          });
        });
      } else {
        validPaths.forEach(({ path, params }, index) => {
          expect(params).instanceOf(
            Object,
            `Invalid valid test data at index ${index}`
          );
          let match;
          const regexp = new RegExp(tested.regex.source, tested.regex.flags);
          expect(() => {
            match = regexp.exec(path);
          }).to.not.throw();
          expect(match).not.null;
          Object.getOwnPropertyNames(params).forEach((paramName) => {
            expect(tested.parameters[paramName]).instanceOf(Object);
            expect(tested.parameters[paramName].value(match)).to.equal(
              params[paramName]
            );
          });
        });

        invalidPaths.forEach(({ path, params }, index) => {
          if (params) {
            throw AssertionError(
              `Invalid test case at ${index} contains parameters`
            );
          }
          let match;
          const regexp = new RegExp(tested.regex.source, tested.regex.flags);
          expect(() => {
            match = regexp.exec(path);
          }).to.not.throw();
          expect(match).null;
        });
      }
      resolve(true);
    } catch (error) {
      if (error instanceof AssertionError) {
        reject(error);
      } else if (error instanceof Error) {
        reject(new AssertionError(`Test failed`, { cause: error }));
      } else {
        reject(new AssertionError(`Test failed. Reason: ${error}`));
      }
    }
  });
}

describe("Unit Test of Path", () => {
  describe("createPath", () => {
    it("Literal path /test/rest", () => {
      const segments = ["test", "rest"];
      const result = createPath(...segments);
      expect(result.segments).eql([...segments]);
      expect(result.parameters).to.be.empty;
      expect(result.regex.source).to.equal(
        escapeRegExp("/" + segments.join("/")) + "(?=\\/|$)"
      );

      const testPath = "/test/rest";
      let match;
      expect(() => {
        match = result.regex.exec(testPath);
      }).not.throw();
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
        escapeRegExp("/" + segments.join("")) + "(?=\\/|$)"
      );

      const testPath = "/testrest";
      let match;
      expect(() => {
        match = result.regex.exec(testPath);
      }).not.throw();
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
          `(?<${segments[1].paramName}>[^\\\/]+?)` +
          "(?=\\/|$)"
      );

      const testPath = "/test/rest";
      let match;
      expect(() => {
        match = result.regex.exec(testPath);
      }).not.throw();
      expect(match).not.null;
      expect(match.index).to.equal(0);
      expect(match[0]).to.equal(testPath);
      expect(result.parameters[segments[1].paramName].value(match)).to.equal(
        "rest"
      );
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
          `\\/\\k<${result.segments[3].paramName}>` +
          "(?=\\/|$)"
      );

      const testPath = "/test/rest/generate/rest";
      let match;
      expect(() => {
        match = result.regex.exec(testPath);
      }).not.throw();
      expect(match).not.null;
      expect(match.index).to.equal(0);
      expect(match[0]).to.equal(testPath);
      expect(result.parameters[segments[1].paramName].value(match)).to.equal(
        "rest"
      );

      expect(
        testSegmentPath(
          result,
          [
            /** @type {PathParam<string>} */ {
              path: testPath,
              params: { eventId: "rest" },
            },
          ],
          [
            /** @type {PathParam<string>} */ {
              path: "/test/rest/genrate/rest",
              params: /** @type {Object.<string, string>} */ {
                eventId: "rest",
              },
            },
          ]
        )
      ).eventually.true;
    });
  });
});
