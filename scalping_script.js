const { Strategy } = require('../strategy/strategy')
const { TdEvent } = require('../strategy/tdEvent')
const { onProductFound } = require("../common/onProductFound")
const { onChart } = require('./onChart')
const { onUserSync } = require('./onUserSync')
const { onProps } = require('./onProps')
const { drawEffect } = require('./drawEffect')
const { LongShortMode } = require('../common/longShortMode')
const relativeStrengthIndex = require("../../utils/rsi")
const highLowVariance = require("../../utils/highLowVariance")
const { DataBuffer, BarsTransformer, TicksTransformer } = require("../../utils/dataBuffer")
const scalpSignal = require("../../utils/scalpSignal")
const alphaVantage = require('./alphaVantage')
const marketStack = require('./marketStack')


class Scalping extends Strategy {
    constructor(params) {
        super(params)	
    }		

    init(props) {
        this.addMiddleware(drawEffect)
        return {
        mode: LongShortMode.Watch, 
        strengthIndex: 	relativeStrengthIndex(props.period),
        product: 		null,
        position: 		null,
        realizedPnL: 	0,
        buffer: 		new DataBuffer(BarsTransformer), 
        scalpSignal: scalpSignal(props.period), 
        alphaVantage: alphaVantage(props.period),
        marketStack: marketStack(props.period), 
        bidVolume: 'something', 
        askVolume: 'something', 
        priceOpen: 'something', 
        priceHigh: 'something', 
        priceLow: 'something', 
        priceClose: 'something', 
        timeStamp: null, 
        chop: 'something',
        status: 'something', 
        killSwitch: false, 
        upTick: null, 
        downTick: null, 
        rangeMarket: null, 
        detail: null, 
        detail2: null, 
        prevBid: null, 
        prevOffer: null, 
        hlv: highLowVariance(props.period), 
        averageTrueRange: null 

    
        }
    }
    next(prevState, [event, payload]) {
        switch(event) {
            case TdEvent.Chart: {
                const { buffer } = prevState
                buffer.push(payload)

                return onChart(prevState, payload)
            }
    
            case TdEvent.Props: {
                return onProps(prevState, payload)
            }
    
            case TdEvent.UserSync: {
                return onUserSync(prevState, payload)
            }
            
            //this one
            case TdEvent.ProductFound: {
                return onProductFound('scalping', prevState, payload)
            }
    
            default: {
                return { state: prevState,
                    effects: [
                        { event: 'scalping/draw' }          
                    ] }
            }
        }
    }

    static params = {
        ...super.params,
        period: 'int', 
        orderQuantity: 'int', 
    }

}

module.exports = { Scalping }



