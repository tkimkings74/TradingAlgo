module.exports =  function scalpSignal(period) {
    function nextSignal(prevState, data) {
       
        const pts = data.slice(data.length - period)
        //const signal = pts.reduce((a, b) => a + b.close || b.price, 0)

        const changes   = pts.map((x, i, arr) => i === 0 ? 0 : (x.close || x.price) - (arr[i-1].close || arr[i-1].price))
        const ups       = changes.filter(x => x > 0).reduce((a, b) => a + b, 0)
        const downs     = changes.filter(x => x < 0).reduce((a, b) => a + b, 0) 
        const result = pts.map((a) => {a.close|| a.price})

        const max = Math.max(result)
        const min = Math.min(result)
        const lastPrice = result[result.length - 1]// pts.slice(-1).close || pts.slice(-1).price or result[result.length - 1]
        const secondLastPrice = result[result.length - 2]
        const upDistance = max - lastPrice
        const downDistance = min - lastPrice

         let upCounter = 0 
        let downCounter = 0

        for (let i = 0; i < result.length; i++) {
            if (result[i] < result[i+1]) {
                upCounter ++ 
            } else if (result[i] > result[i+1]) {
                downCounter ++ 
            }
        }
        let uptrendSetter = false
        let downtrendSetter = false

        if (upCounter > downCounter && upCounter > Math.ceil( period / 2)) {
            uptrendSetter = true
        }   else if (upCounter < downCounter && downCounter > Math.ceil(period / 2)) {
            downtrendSetter = true
        } 
//----------------------->
        //refer to rsi.js to see how it handles the incoming data. 

         for (const i = 0; i < period; i++) {
            result.push(changes[i])
        }  //this creates a separate array that carries all the max values of each stream (buffering) of data
        ////////////////////////////////////////////////////////////

        const thirdLastPrice = result[result.length - 3]
         const fourthLastPrice = result[result.length - 4]
        const fifthLastPrice = result[result.length - 5] 

        if (lastPrice > secondLastPrice &&
            secondLastPrice > thirdLastPrice && 
            thirdLastPrice > fourthLastPrice && 
            fourthLastPrice > fifthLastPrice) {
                buySignal = true
            }
        if (lastPrice < secondLastPrice &&
            secondLastPrice < thirdLastPrice && 
            thirdLastPrice < fourthLastPrice && 
            fourthLastPrice < fifthLastPrice) {
                sellSignal = true
            } 

        ////////////////////////////////////////////////////////////

        /* next = {
            signal: lastPrice, 
            buySignal: upDistance > 0 && lastPrice > secondLastPrice && downDistance < 0 && uptrendSetter,// && signal>prevState.signal,
             //lastPrice > max, //signal > prevState.signal, 
            sellSignal: downDistance < 0 && lastPrice < secondLastPrice && upDistance > 0 && downtrendSetter,//lastPrice < min //signal < prevState.signal
            longProfitTarget: max - lastPrice , 
            longStopLoss: min - lastPrice , 
            shortProfitTarget: min - lastPrice , 
            shortStopLoss: max - lastPrice

        } */
        next = {
            signal: lastPrice, 
            buySignal: lastPrice > prevState.signal, // lastPrice > secondLastPrice,
            sellSignal: lastPrice < prevState.signal, //lastPrice < secondLastPrice,
            lastPrice: lastPrice, 
            secondLastPrice: secondLastPrice, 
            thirdLastPrice: thirdLastPrice,
            longProfitTarget: max - lastPrice , 
            longStopLoss: min - lastPrice , 
            shortProfitTarget: min - lastPrice , 
            shortStopLoss: max - lastPrice

        }
        nextSignal.state = next

        return next
    }

    nextSignal.init = () => {
        nextSignal.state = {
            signal: 0, 
            buySignal: false, 
            sellSignal: false, 
            lastPrice: 0, 
            secondLastPrice: 0, 
            thirdLastPrice: 0,
            longProfitTarget: 0, 
            longStopLoss: 0, 
            shortProfitTarget: 0, 
            shortStopLoss: 0 
        }
    }

    nextSignal.init(); 
    return nextSignal;
    console.log('this tester')
}

