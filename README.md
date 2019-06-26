## Golang Defer implement in Javascript

[![Build Status](https://travis-ci.org/axetroy/godefer.svg?branch=master)](https://travis-ci.org/axetroy/godefer)
[![Coverage Status](https://coveralls.io/repos/github/axetroy/godefer/badge.svg?branch=master)](https://coveralls.io/github/axetroy/godefer?branch=master)
[![Dependency](https://david-dm.org/axetroy/rfcdate.svg)](https://david-dm.org/axetroy/rfcdate)
![License](https://img.shields.io/badge/license-Apache-green.svg)
[![Prettier](https://img.shields.io/badge/Code%20Style-Prettier-green.svg)](https://github.com/prettier/prettier)
![Node](https://img.shields.io/badge/node-%3E=6.0-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/rfcdate.svg)](https://badge.fury.io/js/rfcdate)
![Size](https://github-size-badge.herokuapp.com/axetroy/godefer.svg)

## Apply

You can use defer to do some job. e.g
 
- **Destroy resource**
- **Auto Commit or Rollback in Transaction**

## Usage

```javascript
const godefer = require('godefer');
const db = require('./db');

const getUserInfo = godefer(async function(username, defer) {
  const client = await db.createConnection();

  defer(function(err, result) {
    client.close(); // close connection after job done
  });

  const data = await client.query({ username });

  return data;
});

getUserInfo('axetroy')
  .then(function(info) {
    console.log(info);
  })
  .catch(function(err) {
    console.error(err);
  });
```

And here is the Golang code doing same with above

```go
func getUserInfo(username string) (*User, error) {
  client, err := db.CreateConnection()
  if (err != nil) {
    return nil, err
  }

  defer func() {
    client.Close() // close connection after job done
  }()

  data := client.Qeury(map[string]interface{}{
    "username": username,
  })

  return &data, nil
}

func main() {
  if user, err := getUserInfo("axetroy"); err != nil {
    panic(err)
  }
  fmt.Println(user)
}
```

## API

### godefer(func:Function):deferFunction

- **func**: It can be a common function or async function
- **deferFunction**: It's a function wrap with ``func``, the last argument must be **defer**

### defer(cb:(err: Error|null, result:any)=>void):void

The defer task will run from the latest, Like Golang

## Contributing

[Contributing Guide](https://github.com/axetroy/godefer/blob/master/CONTRIBUTING.md)

如果你觉得项目不错，不要吝啬你的 star.

长期造轮子，欢迎 follow.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

| [<img src="https://avatars1.githubusercontent.com/u/9758711?v=3" width="100px;"/><br /><sub>Axetroy</sub>](http://axetroy.github.io)<br />[💻](https://github.com/axetroy/godefer/commits?author=axetroy) [🐛](https://github.com/axetroy/godefer/issues?q=author%3Aaxetroy) 🎨 |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |


<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Faxetroy%2Fgodefer.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Faxetroy%2Fgodefer?ref=badge_large)
