# Bitdock

A lightweight Mac OSX tray application that tracks the prices of cryptocurrency.
Currently supports BTC, ETH, LTC, DASH, ZEC, XRP.

The app sits in the top-menu and shows the value of the selected crypto in either USD, GBP or EUR and refreshes every minute.

Built with [Electron](http://electron.atom.io), uses the [CryptoCompare API](https://www.cryptocompare.com/api).

## Running

```sh
git clone https://github.com/chrisunderdown/bitdock
cd bitdock
npm install
npm start
```

## Packaging

```sh
npm run package
open out/Bitdock-darwin-x64/Bitdock.app
```
