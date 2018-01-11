import test from "ava";
import godefer from "../index";

test("if main function throw", t => {
  const step = [];
  const main = godefer(function(defer) {
    step.push(1);
    defer(function() {
      step.push(2); // even main function throw an error, it still going on
    });
    step.push(3);

    throw new Error("main throw error");
  });

  t.throws(function() {
    return main();
  }, "main throw error");

  t.deepEqual(step, [1, 3, 2]);
});

test("if async main function throw", async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function() {
      step.push(2); // even main function throw an error, it still going on
    });
    step.push(3);

    throw new Error("async main throw error");
  });

  try {
    await main();
    t.fail("it should reject");
  } catch (err) {
    t.deepEqual(err.message, "async main throw error");
  }

  t.deepEqual(step, [1, 3, 2]);
});