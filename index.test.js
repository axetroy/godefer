import test from 'ava';
import df from './index';

function sleep(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, ms);
  });
}

test('Basic', t => {
  const step = [];

  const main = df(function(name, defer) {
    t.log('Get user info of ', name);

    t.log('Create connection to Database');

    step.push(1);

    defer(function() {
      t.log('Disconnect from Database');
      step.push(2);
    });
    t.log('The main function have reach last code');

    step.push(3);
  });

  main('axetroy');

  t.deepEqual(step, [1, 3, 2]);
});

test('Async', async t => {
  const step = [];

  const main = df(async function(name, defer) {
    t.log('Get user info of ', name);

    await sleep(100);

    t.log('Create connection to Database');

    step.push(1);

    defer(function() {
      t.log('Disconnect from Database');
      step.push(2);
    });

    t.log('The main function have reach last code');

    await sleep(100);

    step.push(3);
  });

  await main('axetroy');

  t.deepEqual(step, [1, 3, 2]);
});

test('Ensure the order of operation', t => {
  const step = [];

  const main = df(function(name, defer) {
    t.log('Get user info of ', name);

    t.log('Create connection to Database');

    step.push(1);

    defer(function() {
      t.log('Disconnect from Database');
      step.push(2);
    });

    step.push(3);

    t.log('Create rpc');

    defer(function() {
      t.log('Destroy rpc connection');
      step.push(4);
    });

    step.push(5);
  });

  main('axetroy');

  // step [2,4] in the defer function
  t.deepEqual(step, [1, 3, 5, 4, 2]);
});

test('Ensure the order of operation in async function', async t => {
  const step = [];

  const main = df(async function(name, defer) {
    t.log('Get user info of ', name);

    await sleep(100);

    t.log('Create connection to Database');

    step.push(1);

    defer(function() {
      t.log('Disconnect from Database');
      step.push(2);
    });

    await sleep(100);

    step.push(3);

    t.log('Create rpc');

    await sleep(100);

    defer(function() {
      t.log('Destroy rpc connection');
      step.push(4);
    });

    step.push(5);
  });

  await main('axetroy');

  t.deepEqual(step, [1, 3, 5, 4, 2]);
});

test('Make sure argument', async t => {
  const hi = df(function(name) {
    return 'hello ' + name;
  });

  t.deepEqual(hi('world'), 'hello world');

  const hiAsync = df(async function sayHi(name) {
    await sleep(100);
    return 'hello ' + name;
  });

  t.deepEqual(await hiAsync('world'), 'hello world');
});

test('Make sure get var in defer function', async t => {
  const getUserInfo = df(function(name, defer) {
    defer(
      function() {
        t.deepEqual(this.username, 'axetroy');
        console.log('Get information of', this.username);
      }.bind({ username: name })
    );

    // change username here
    name = 'world';

    return 'hello ' + name;
  });

  getUserInfo('axetroy');
});

test('If reject', async t => {
  const hi = df(function(name) {
    return 'hello ' + name;
  });

  t.deepEqual(hi('world'), 'hello world');

  const hiAsync = df(async function sayHi(name, defer) {
    defer(function() {
      console.log('run defer block 1');
    });
    await sleep(100);

    defer(function() {
      console.log('run defer block 2');
    });

    throw new Error('test error');
  });

  try {
    await hiAsync('world');
    t.fail('It should throw an error');
  } catch (err) {
    t.deepEqual(err.message, 'test error');
  }
});
