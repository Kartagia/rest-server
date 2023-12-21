import { validGroupName, validFlag } from "../src/regexp_tools.mjs";
import { describe } from "mocha";
import { expect } from "chai";

describe("Flags", () => {
  const validFlags = "dgimsuvy";
  const invalidFlags = "abcefhjklnopqrtwxz \t()[]{}";

  validFlags.split("").forEach((flag) => {
    it(`Valid flag ${flag}`, () => {
      expect(validFlag(flag)).to.true;
    });
  });

  invalidFlags.split("").forEach((flag) => {
    it(`Invalid flag ${flag}`, () => {
      expect(validFlag(flag)).to.false;
    });
  });
});

const validGroupNames = ["_", "abBA", "a9", "n_9", "_B", "C_"];

const invalidGroupNames = [null, 1, "1", "", "n-9", "m~3", ".1", "3:", "A:3"];

describe("RegExp Groups", () => {
  describe("Valid group names", () => {
    validGroupNames.forEach((groupName) => {
      it(`Valid group name ${groupName}`, () => {
        expect(validGroupName(groupName)).to.true;
      });
    });
  });
  describe("Invalid group names", () => {
    invalidGroupNames.forEach((groupName) => {
      it(`Invalid group name ${groupName}`, () => {
        expect(validGroupName(groupName)).to.false;
      });
    });
  });
});
