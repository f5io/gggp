
```
                             _         _   
   ___ ___ ___ ___ ___ ___ _| |___ ___| |_ 
  | . | . | . | . | . | .'| . | . | -_|  _|
  |_  |___|_  |___|_  |__,|___|_  |___|_|  
  |___|_ _|___|_| |___|_      |___|        
   _| . |  _| . |  _| . |                  
  |_|  _|_| |___|_| |___|  go go gadget .proto                
    |_|

```

### go go gadget .proto

a dependency manager for protobuf files.

#### usage

```
  Usage: gggp [options] [command]


  Commands:

    init                                   install all dependencies from `Gadgetfile`
    get [options] [proto]                  get dependency and resolve tree
    resolve|link [options] <link> <proto>  resolve a dodgy import with its correct link
    cache <cmd>                            manage the cache that sits behind gggp
    login [options]                        login to github
    logout                                 logout of github

  go go gadget proto - dependency management for .proto files

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

##### `gggp init`

```
  Usage: init [options]

  install all dependencies from `Gadgetfile`

  Options:

    -h, --help  output usage information
```

##### `gggp get [options] [proto]`

```
  Usage: get [options] [proto]

  get dependency and resolve tree

  Options:

    -h, --help         output usage information
    -s, --sha <sha>    sha of the github proto to use
    -p, --path <path>  path to store protos locally
```

##### `gggp resolve|link [options] <link> <proto>`

```
  Usage: resolve|link [options] <link> <proto>

  resolve a dodgy import with its correct link

  Options:

    -h, --help       output usage information
    -s, --sha <sha>  sha of the github proto to use
```

##### `gggp cache <cmd>`

```
  Usage: cache [options] <cmd>

  manage the cache that sits behind gggp

  Options:

    -h, --help  output usage information
```

Currently supported commands:

  - `clear` - clear the cache

##### `gggp login`

```
  Usage: login [options]

  login to github

  Options:

    -h, --help                 output usage information
    -u, --username <username>  your github login
    -p, --password <password>  your github password or a personal access token
```

##### `gggp logout`

```
  Usage: logout [options]

  logout of github

  Options:

    -h, --help  output usage information
```
