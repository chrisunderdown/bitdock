<img src="icon.png" style="width: 100px; height: 100px;"/>
# Bitdock

A lightweight Mac OSX tray application that tracks the Bitcoin Price Index.

The app sits in the top-menu and shows the value of Bitcoin in either USD, GBP or EUR and refreshes every minute.

Built with [Electron](http://electron.atom.io)
Uses the [Coindesk API](https://www.coindesk.com/api/.

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
