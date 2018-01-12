import test from 'ava';
import godefer from '../index';

test('Basic use', async t => {
  const step = [];
  const main = godefer(async defer => {
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  await main();

  t.deepEqual(step, [1, 3, 2]);
});

test('Not a async function and it should throw an error', async t => {
  t.throws(function() {
    godefer(function() {});
  });
});

test('Make sure argument pass', async t => {
  const step = [];
  const main = godefer(async (argv1, argv2, defer) => {
    t.deepEqual(argv1, 'a');
    t.deepEqual(argv2, 'b');
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  await main('a', 'b');

  t.deepEqual(step, [1, 3, 2]);
});

test('err fist in defer argument', async t => {
  const step = [];
  const main = godefer(async defer => {
    step.push(1);
    defer(function(err, res) {
      t.deepEqual(err, null);
      t.deepEqual(res, 'hello');
      step.push(2);
    });
    step.push(3);

    return 'hello';
  });

  await main();

  t.deepEqual(step, [1, 3, 2]);
});
