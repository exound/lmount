import {expect} from "chai";
import {Data, Mount} from "../src/lmount";

function reset(data) {
  data.content$({});
  data.updated$(undefined);
}

describe("Mount", () => {
  const data = Data.wrap({});
  const mount = Mount.on({path: ["a", "b", "c"], data});

  beforeEach(() => reset(data));

  describe("set #value() & get #value()", () => {
    it("updates the value of specified path", () => {
      expect(mount.value).to.equal(undefined);
      expect(data.content$().a).to.equal(undefined);

      mount.value = 4;

      expect(mount.value).to.equal(4);
      expect(data.content$().a.b.c).to.equal(4);
    });
  });
});
