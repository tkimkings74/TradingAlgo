module.exports =  function scalpSignal(period) {
    function nextSignal(prevState, data) {
       

        const pts = data.slice(data.length - period)
        //const signal = pts.reduce((a, b) => a + b.close || b.price, 0)

        const results  = pts.map((x, i, arr) => i === 0 ? 0 : (x.close || x.price)) //- (arr[i-1].close || arr[i-1].price))
        /* const ups       = changes.filter(x => x > 0).reduce((a, b) => a + b, 0)
        const downs     = changes.filter(x => x < 0).reduce((a, b) => a + b, 0) */
        //const result = pts.map((a) => {a.close|| a.price})

        const max = Math.max(results)
        const min = Math.min(results)
      

        const bids = pts.map((x, i, arr) => i === 0 ? 0 : (x.bidVolume))
        const offer = pts.map((x, i, arr) => i === 0 ? 0 : (x.offerVolume))
        const upVolumeList = pts.map((x, i, arr) => i === 0 ? 0 : (x.upVolume))
        const downVolumeList = pts.map((x, i, arr) => i === 0 ? 0 : (x.downVolume))

        const lastUpVolume = upVolumeList[upVolumeList.length - 1]
        const lastDownVolume = downVolumeList[downVolumeList.length - 1]
        const secondUpVolume = upVolumeList[upVolumeList.length - 2]
        const secondDownVolume = downVolumeList[downVolumeList.length - 2]

        const lastBid = bids[bids.length - 1]
        const secondLastBid = bids[bids.length - 2]
        const thirdLastBid = bids[bids.length - 3]

        const lastOffer = offer[offer.length - 1]
        const secondLastOffer = offer[offer.length - 2]
        const thirdLastOffer = offer[offer.length - 3]
//==========================================================================================================================> 
// below starts the c-o-c method 

        const results2  = pts.map((x, i, arr) => i === 0 ? 0 : {high: x.high, 
                                                                low: x.low}).slice(1)
        let upCounter = 0 
        let downCounter = 0

        for (let i = 0; i < results2.length -1; i++) {
            if (results2[i].high < results2[i+1].high
                && results2[i].low < results2[i+1].low) {
                upCounter ++ 
            }
            if (results2[i].high > results2[i+1].high
                && results2[i].low > results2[i+1].low) {
                downCounter ++ 
            }
        }
        const param = upCounter > downCounter ? upCounter / period : -downCounter / period

        let uptrendSetter = false
        let downtrendSetter = false

        if (upCounter > downCounter /* && upCounter > Math.ceil( period / 2) */) {
            uptrendSetter = true
        }   else if (upCounter < downCounter /* && downCounter > Math.ceil(period / 2) */) {
            downtrendSetter = true
        } 

        let hiArray = []
        let loArray = []

        for (let i = 0; i < results2.length; i++) {
            hiArray.push(results2[i].high)
            loArray.push(results2[i].low)
        }

        let maxPrice = Math.max(hiArray)
        let minPrice = Math.min(loArray)
        const lastPrice = results[results.length - 1]
        const upDistance = maxPrice - lastPrice 
        const downDistance = minPrice - lastPrice
        let initialBuySignal = false 
        let initialSellSignal = false

        if (uptrendSetter && !downtrendSetter && upDistance > 0 && downDistance == 0) {
            let initialCounter = 0 
            for (let i = 0; i < hiArray.length - 1; i++) {
                if (hiArray[i] > hiArray[i+1]) {
                    initialCounter ++ 
                }
            }
            if (lastPrice > hiArray[hiArray.length - 2] && initialCounter > 0) {
                initialBuySignal = true
            }
        }
        
        if (!uptrendSetter && downtrendSetter && downDistance < 0 && upDistance == 0) {
            let initialCounter = 0 
            for (let i = 0; i < hiArray.length - 1; i++) {
                if (hiArray[i] < hiArray[i+1]) {
                    initialCounter ++ 
                }
            }
            if (lastPrice < hiArray[hiArray.length - 2] && initialCounter > 0) {
                initialSellSignal = true
            }
        }

        
//----------------------->
        
        ///////////////////////////////////////////////////////////

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
        /* next = {
            signal: lastPrice, 
            buySignal: lastPrice > secondLastPrice && lastBid > secondLastBid && secondLastBid > thirdLastBid ,
            sellSignal:lastPrice < secondLastPrice && lastBid < secondLastBid && secondLastBid < thirdLastBid,
    
        } */

        //--------------------below starts choppiness index function 
    const ptss = data
    const tr  = ptss.map((x, i, arr) => i === 0 ? 0 : {
        tr1: Math.abs(x.high - x.low ), 
        tr2: Math.abs(x.high - x.close),
        tr3: Math.abs(x.low - x.close)
    })
    const highs = ptss.map((x, i, arr) => i === 0 ? 0 : (x.high)) 
    const lows = ptss.map((x, i, arr) => i === 0 ? 0 : (x.low))
    const maxHi = Math.max(...highs)
    const minLo = Math.min(...lows)


    
    let trueRange = []
    tr.shift()

    for (let i = 0; i < tr.length; i ++) {
        maxRange = Math.max(...Object.values(tr[i]))
        trueRange.push(maxRange)
    }

    const sum = trueRange.reduce((partialSum, a) => partialSum + a, 0);

    const choppiness = 100 * Math.log10(sum) / (maxHi - minLo) / Math.log10(period) 
    //==================================above ends the choppinessindex function
    //  Here is the section that determines if the market is in range bound or not
    const tickLookBackPeriod = 5

    const lookBackUpTick = data.slice(data.length - tickLookBackPeriod).map((x, i, arr) => i === 0 ? 0 : x.upTicks).slice(1)
    const lookBackDownTick = data.slice(data.length - tickLookBackPeriod).map((x, i, arr) => i === 0 ? 0 : x.downTicks).slice(1)

    const upTickAverage = lookBackUpTick.reduce((partialSum, a) => partialSum + a, 0) / 30 
    const downTickAverage = lookBackDownTick.reduce((partialSum, a) => partialSum + a, 0) / 30 
 
    const rangeMarket1 = (upTickAverage - downTickAverage)
    const rangeMarket1Fixed = (upTickAverage - downTickAverage).toFixed(4)


    //======================================================================================================================>
    //range bound indicator version 2.0     
    const lookBackElementPeriod = 10
    const lookBackElement = data.slice(data.length - lookBackElementPeriod)
    const list1 = []
    const lookBackElement1 = lookBackElement.map((x, i, arr) => i === 0 ? 0 : {
        open1: x.open, 
        close1: x.close,
        high1: x.high, 
        low1: x.low
    })
    const lookBackElement2 = lookBackElement1.slice(1)

    for (let i = 0; i < lookBackElement2.length -1; i++) {
        const barRange = lookBackElement2[i].high1 - lookBackElement2[i].low1
        const nextBarRange = lookBackElement2[i+1].high1 - lookBackElement2[i+1].low1

        if (lookBackElement2[i+1].high1 <= lookBackElement2[i].high1 
            && lookBackElement2[i+1].high1 > lookBackElement2[i].low1
            && lookBackElement2[i+1].low1 >= lookBackElement2[i].low1
            && lookBackElement2[i+1].low1 < lookBackElement2[i].high1  ) { // outside in bar. 
                list1.push(1)
            }
        if (lookBackElement2[i+1].high1 > lookBackElement2[i].high1 
            && lookBackElement2[i+1].low1 < lookBackElement2[i].low1) { // inside outside bar.  
                list1.push(1)
            }
        if ((lookBackElement2[i+1].high1 == lookBackElement2[i].high1 
            && lookBackElement2[i+1].low1 >= lookBackElement2[i].low1) || 
            (lookBackElement2[i+1].low1 == lookBackElement2[i].low1 
                && lookBackElement2[i+1].high1 <= lookBackElement2[i].high1)) { // upper touch . 
                const coverage = nextBarRange/barRange
                list1.push(coverage)
            }
        if ((lookBackElement2[i+1].high1 > lookBackElement2[i].high1 
            && lookBackElement2[i+1].low1 == lookBackElement2[i].low1) || 
            (lookBackElement2[i+1].low1 <lookBackElement2[i].low1 
                && lookBackElement2[i+1].high1 == lookBackElement2[i].high1)) { // bottom touch. 
                const coverage = barRange / nextBarRange
                list1.push(coverage)
            }
        if (lookBackElement2[i+1].high1 > lookBackElement2[i].high1 
            && lookBackElement2[i+1].low1 > lookBackElement2[i].low1) { // higher high higher low 
                const coverage = (lookBackElement2[i].high1 - lookBackElement2[i+1].low1) / barRange
                list1.push(coverage)
            }
        if (lookBackElement2[i+1].high1 < lookBackElement2[i].high1
            && lookBackElement2[i+1].low1 < lookBackElement2[i].low1) { // lower high lower low
                const coverage = (lookBackElement2[i+1].high1 - lookBackElement2[i].low1) / barRange
                list1.push(coverage)
            }
        if ((lookBackElement2[i+1].high1 > lookBackElement2[i].high1 
            && lookBackElement2[i+1].low1 > lookBackElement2[i].high1) || 
            (lookBackElement2[i+1].low1 <lookBackElement2[i].low1 
                && lookBackElement2[i+1].high1 < lookBackElement2[i].low1)) { // bottom touch. 
                list1.push(0)
            }

    }

    const list1Sum = list1.reduce((partialSum, a) => partialSum + a, 0)
    const averageCoverage = (list1Sum / lookBackElementPeriod).toFixed(4)
    //======================================================================================================================>
    // td strategy #1 differential https://towardsdatascience.com/technical-pattern-recognition-for-trading-in-python-63770aab422f

    const lastElement = lookBackElement1[lookBackElement1.length - 1]
    const secondLastElement = lookBackElement1[lookBackElement1.length - 2]
    const thirdLastElement = lookBackElement1[lookBackElement1.length - 3]
    const fourthLastElement = lookBackElement1[lookBackElement1.length - 4]

    const prevTrueLow = Math.min(thirdLastElement.low1, secondLastElement.low1)
    const prevTrueHigh = Math.max(thirdLastElement.high1, secondLastElement.high1)
    const prevBuyingPressure = secondLastElement.close1 - prevTrueLow
    const prevSellingPressure = secondLastElement.close1 - prevTrueHigh

    const currentTrueLow = Math.min(lastElement.low1, secondLastElement.low1)
    const currentTrueHigh = Math.max(lastElement.high1, secondLastElement.high1)
    const currentBuyingPressure = lastElement.close1 - currentTrueLow
    const currentSellingPressure = lastElement.close1 - currentTrueHigh
    
    let buyPressureSignal = false 
    let sellPressureSignal = false 

    if (/* lastElement.close1 < secondLastElement.close1 && 
        secondLastElement.close1 < thirdLastElement.close &&  */
        currentBuyingPressure > prevBuyingPressure && 
        currentSellingPressure < prevSellingPressure )
        {
            buyPressureSignal = true
        }

    if (/* lastElement.close1 > secondLastElement.close1 && 
        secondLastElement.close1 >thirdLastElement.close &&  */
        currentBuyingPressure < prevBuyingPressure && 
        currentSellingPressure > prevSellingPressure )
        {
            sellPressureSignal = true
        }








    //======================================================================================================================>
    // strategy #2 delta divergence 

    const lastDelta = lastOffer - lastBid 
    const secondLastDelta = secondLastOffer - secondLastBid 

    const deltaBuy = lastDelta > secondLastDelta  && lastElement.low1 < secondLastElement.low1 
                     && lastElement.high1 < secondLastElement.high1
     // or, lastDelta > 0 && secondLastDelta < 0 

    const deltaSell = lastDelta < secondLastDelta  && lastElement.low1 > secondLastElement.low1 
                     && lastElement.high1 > secondLastElement.high1 
     // or, lastDelta < 0 && secondLastDelta > 0 


     const thirdLastDelta = thirdLastOffer - thirdLastBid 
     const deltaBuy2 = secondLastDelta > (thirdLastDelta * 1.5)  && secondLastElement.low1 < thirdLastElement.low1
                     && secondLastElement.high1 < thirdLastElement.high1 

     const deltaSell2 = (secondLastDelta * 1.5) < thirdLastDelta  && secondLastElement.low1 > thirdLastElement.low1
                     && secondLastElement.high1 > thirdLastElement.high1

    

  //======================================================================================================================>
  //average true range (atr) calculation
  const atrPeriod = 14
  const atrArray = data.slice(data.length - atrPeriod)
  const atrArray2 = lookBackElement.map((x, i, arr) => i === 0 ? 0 : {
      open1: x.open, 
      close1: x.close,
      high1: x.high, 
      low1: x.low
  })
  let totalRange = 0

  for (let i = 0; i < atrArray2.length; i ++) {
    let maxRange = Math.max(atrArray2[i].high1 - atrArray2[i].low1, Math.abs(atrArray2[i].high1 - atrArray2[i].close1), 
    Math.abs(atrArray2[i].low1 - atrArray2[i].close1) )
    totalRange += maxRange
  }

  const averageTrueRange = totalRange / atrPeriod 



  


    //======================================================================================================================>
    // the following code calculates balance of power (bop) for buying / selling pressure
     
    const lastBOP = (lastElement.close1 - lastElement.open1) / (lastElement.high1 - lastElement.low1)
    const secondLastBOP = (secondLastElement.close1 - secondLastElement.open1) / (secondLastElement.high1 - secondLastElement.low1)

    const upVolume1 = lastUpVolume > lastDownVolume? lastUpVolume / lastDownVolume : -1 * (lastDownVolume / lastUpVolume)
    const upVolume2 = secondUpVolume > secondDownVolume? secondUpVolume / secondDownVolume : -1 * (secondDownVolume / secondUpVolume)

     //======================================================================================================================>
// another strategy idea: combine bid/volume relation with buy/sell pressure clear

        next = {
            signal: lastPrice, 
            buySignal:  /* lastPrice > secondLastPrice && 
                        secondLastPrice > thirdLastPrice && */
                
                       // buyPressureSignal && 
                        //upVolume1 > 2 && 
                        // balanceOfPower > 0 && (prevState.balanceOfPower < 0 || prevState.balanceOfPower == null) &&
                        //upVolume1 > 1.2 && 

                        deltaBuy && lastPrice <= ( Math.min(secondLastElement.open1, secondLastElement.close1) + secondLastElement.low1 ) /2 





                       && upVolume1 > 0  // && averageCoverage < 0.5 &&
                        //  (secondLastBid * 1.5) < secondLastOffer &&  rangeMarket1 > 10 
                        // && lookBackUpTick[lookBackUpTick.length - 1] > (1.5* lookBackDownTick[lookBackDownTick.length - 1])



                    /*       buyPressureSignal  */
                        /* &&  (thirdLastBid * 1) < thirdLastOffer 
                         && initialBuySignal */
                         /* initialBuySignal && */,
            sellSignal: /* lastPrice < secondLastPrice && 
                        secondLastPrice < thirdLastPrice && */
                        //sellPressureSignal && 
                        //upVolume1 < -2 &&  
                        //balanceOfPower < 0 && (prevState.balanceOfPower > 0 || prevState.balanceOfPower == null) &&
                       // upVolume1 < -1.2 && 

                       deltaSell&& lastPrice >= ( Math.max(secondLastElement.open1, secondLastElement.close1) + secondLastElement.high1) /2 


                       && upVolume1 < 0 // &&  averageCoverage < 0.5  &&
                       //   secondLastBid > (secondLastOffer * 1.5)  &&  rangeMarket1 < -10 
                        // && (lookBackUpTick[lookBackUpTick.length - 1]*1.5) < lookBackDownTick[lookBackDownTick.length - 1],
                         /* && thirdLastBid > (thirdLastOffer * 1)  
                         && initialSellSignal */
                         /* initialSellSignal && *//*  sellPressureSignal, */,
            choppiness: averageCoverage,
            rangeMarket1: averageTrueRange, //balanceOfPower,//rangeMarket1Fixed, 
            someDetail: upVolume1, 
            someDetail2: upVolume2, 
            prevBarBid: secondLastBid, 
            prevBarOffer: secondLastOffer, 
            lastBOP, 
            averageTrueRange1: totalRange //averageTrueRange

        }
        nextSignal.state = next

        return next
    }

    nextSignal.init = () => {
        nextSignal.state = {
            signal: 0, 
            buySignal: false, 
            sellSignal: false, 
            choppiness: 66, 
            rangeMarket1: 77, 
            someDetail: 11,
            someDetail2: 22, 
            averageTrueRange1: 11
        }
    }

    nextSignal.init(); 
    return nextSignal;


}

