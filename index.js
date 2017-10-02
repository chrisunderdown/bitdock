const {ipcRenderer, shell} = require('electron')
var currency = 'USD'

document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    updateBitcoin()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  } else if (event.target.classList.contains('tab-item')) {
    switchCurrency(event)
  }
})


const updateBitcoin = () => {

  const url = `https://api.coindesk.com/v1/bpi/currentprice.json`

  fetch(url)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Error: ' +  response.status);
        return;
      }

      // Examine the text in the response
      response.json().then(function(bitcoin) {
        ipcRenderer.send('bitcoin-updated', bitcoin, currency)
        updateView(bitcoin)
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error:', err);
  });


}

const updateView = (bitcoin) => {
  document.querySelector('.js-summary').textContent = ''
  document.querySelector('.js-usd').textContent = `$${Math.round(bitcoin.bpi.USD.rate_float)}`
  document.querySelector('.js-usd-rate').textContent = bitcoin.bpi.USD.rate
  document.querySelector('.js-gbp').textContent = `£${Math.round(bitcoin.bpi.GBP.rate_float)}`
  document.querySelector('.js-gbp-rate').textContent = bitcoin.bpi.GBP.rate
  document.querySelector('.js-eur').textContent = `€${Math.round(bitcoin.bpi.EUR.rate_float)}`
  document.querySelector('.js-eur-rate').textContent = bitcoin.bpi.EUR.rate
}


// Refresh currency every 10 minutes
const oneMinute = 10 * 60 * 100
setInterval(updateBitcoin, oneMinute)


function switchCurrency(event) {
  var tabs = document.querySelectorAll('.tab-item')
  var local = event.target.dataset.currency
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active')
  }
  event.target.classList.add('active')
  currency = local
  updateBitcoin()
}


// Update initial currency when loaded
document.addEventListener('DOMContentLoaded', updateBitcoin)
