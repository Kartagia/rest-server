import {
  validGroupName,
  validFlag,
  createRegExpGroupEnd,
  createRegExpGroupStart,
} from "../src/regexp_tools.mjs";
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

  describe("Start of Group", () => {
    validGroupNames.forEach((groupName, index) => {
      it(`Valid group "${groupName}" start`, () => {
        expect(createRegExpGroupStart(groupName)).to.equal(`(?<${groupName}>`);
      });
      it(`Valid group "${groupName}" with ${index} previous group names start`, () => {
        expect(createRegExpGroupStart(groupName, index)).to.equal(
          `(?<${groupName}${index ? index : ""}>`
        );
      });
    });
    it(`Start of a character class`, () => {
      expect(createRegExpGroupStart("[")).to.equal("[");
    });
    it(`Start of a character class with index 5`, () => {
      expect(createRegExpGroupStart("[", 5)).to.equal("[");
    });
  });

  describe("End of Group", () => {
    validGroupNames.forEach((groupName, index) => {
      it(`Valid group "${groupName}" end`, () => {
        expect(createRegExpGroupEnd(groupName)).to.equal(")");
        expect(createRegExpGroupEnd(groupName, index)).to.equal(")");
      });
    });
    it(`A character class`, () => {
      expect(createRegExpGroupEnd("[")).to.equal("]");
    });
    it(`A character class with index 5`, () => {
      expect(createRegExpGroupEnd("[", 5)).to.equal("]");
    });
  });
});
