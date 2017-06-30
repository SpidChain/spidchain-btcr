# Implementation of Christopher Allen's btcr

```
$ cp .deploy/dev/settings-template.json  .deploy/dev/settings.json
$ npm install
$ meteor run --settings .deploy/dev/settings.json
```

Tests:

```
$ bitcoind -regtest -rpcuser=foo -rpcpassword=bar -server -daemon
$ meteor test --settings .deploy/dev/settings.json --driver-package practicalmeteor:mocha
```
