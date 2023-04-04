
module.exports = function marketStack(period) {
    function nextMS() {
        let response1
        const axios = require('axios');
        const params = {
            access_key: '*********************'
            }

        axios.get('https://api.marketstack.com/v1/tickers/aapl/eod', {params}).then(response => {
    const apiResponse = response.data;
    if (Array.isArray(apiResponse['data'])) {
        apiResponse['data'].forEach(stockData => {
              console.log(`Ticker ${stockData['symbol']}`,
                  `has a day high of ${stockData['high']}`,
                  `on ${stockData['date']}`);
        });
        response1 = apiResponse
    }
  }).catch(error => {
    console.log(error);
  });
        
    
        const next = {
            importantData: response1
        }

        nextMS.state = next

        return next
    }

    nextMS.init = () => {
        nextMS.state = {
            importantData: 'data2',
        }
    }

    nextMS.init()

    return nextMS
}
