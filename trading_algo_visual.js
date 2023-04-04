const calculatePnL  = require("../../utils/calculatePnL")
const drawToConsole = require("../../utils/drawToConsole")
const maxLoss = -200
const { LongShortMode } = require("../common/longShortMode")

const drawEffect = (state, action) => {
    const [event, payload] = action
    const {positions} = state
    
    if(event === 'scalping/draw') {
        const { props } = payload
        const { contract } = props
        const { product, someDetail, position,  mode, buffer, strengthIndex, 
              realizedPnL, chop, status, rangeMarket, detail, detail2, prevOffer, prevBid, averageTrueRange} = state
        
        let multipleContractsCounter = 0 
        if (status > 1 || status < -1) {
            multipleContractsCounter ++ 
        }

        drawToConsole({
            mode,
            contract: contract.name,      
            netPos: position?.netPos || 0,
            'price': buffer.last()?.close,
            'p&l': position && position?.netPos !== 0 && product  
                ? `$${
                    calculatePnL({
                        price: buffer.last()?.price || buffer.last()?.close || 0, 
                        contract, 
                        position, 
                        product,
                    }).toFixed(2)
                }` 
                : '$0.00',
            realizedPnL: `$${realizedPnL.toFixed(2)}`, 
            /* bidVolume: buffer.last()?.bidVolume, 
            askVolume: buffer.last()?.offerVolume, */
            timeStamp: buffer.last()?.timestamp, 
            /* upTick: buffer.last()?.upTicks, 
            downTick: buffer.last()?.downTicks, */
            chop, 
            rangeMarket, 
            status, 
            detail,
            detail2, 
            averageTrueRange

            /* prevBid, 
            prevOffer */
            
        })    
        const status2 = position?.netPos || 0 
        if ( status2 == 0  && mode != LongShortMode.Watch  ) {
            state.mode = LongShortMode.Watch  
        }  
         
        
    }
    

    return action
}

module.exports = { drawEffect }