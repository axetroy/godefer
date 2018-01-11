import test from "ava";
import godefer from "../index";

test("Basic use", t => {
  const step = [];
  const main = godefer(function(defer) {
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  main();

  t.deepEqual(step, [1, 3, 2]);
});
