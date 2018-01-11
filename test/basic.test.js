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

test("Make sure argument pass", t => {
  const step = [];
  const main = godefer(function(argv1, argv2, defer) {
    t.deepEqual(argv1, "a");
    t.deepEqual(argv2, "b");
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  main("a", "b");

  t.deepEqual(step, [1, 3, 2]);
});

test("err fist in defer argument", t => {
  const step = [];
  const main = godefer(function(defer) {
    step.push(1);
    defer(function(err, res) {
      t.deepEqual(err, null);
      t.deepEqual(res, "hello");
      step.push(2);
    });
    step.push(3);

    return "hello";
  });

  main();

  t.deepEqual(step, [1, 3, 2]);
});
