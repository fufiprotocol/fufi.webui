import React, {FC, memo, ReactElement, useCallback, useEffect, useState} from 'react'
import Baseweb from '@/components/baseContainer/webwrap'
import './index.scss'
import {TVChartContainer} from "@/components/TradingView";
import icon_account from "@/assets/images/mp/icon_account.svg";
import icon_handicap from "@/assets/images/mp/icon_handicap.svg";
import icon_order from "@/assets/images/mp/icon_order.svg";
import icon_price from "@/assets/images/mp/icon_price.svg";
import icon_account_check from "@/assets/images/mp/icon_account_check.svg";
import icon_handicap_check from "@/assets/images/mp/icon_handicap_check.svg";
import icon_order_check from "@/assets/images/mp/icon_order_check.svg";
import icon_price_check from "@/assets/images/mp/icon_price_check.svg";
import icon_close from "@/assets/images/mp/icon_close.svg";
import Icon from "@/components/Icon";
import eth from "@/assets/images/common/eth.svg";
import {StorageHelper} from "@/utils/storage";
import ServerApi from "@/api";
import icon_down_arrow from "@/assets/images/common/icon_down_arrow.svg";
import {$times, $toFixed} from "@/utils";
import {useSelector} from "react-redux";
import {AppState} from "@/state";
import dayjs from "dayjs";

const Home: FC = (): ReactElement => {
    const {account} = useSelector((state: AppState) => state.baseInfo);
    const [orderTabList, setOrderTabList] = useState<any[]>([]);
    const [tabVal, setTabVal] = useState<string>('account');
    const [orderTab, setOrderTab] = useState<string>('Order');
    const [tradePairList, setTradePairList] = useState<any[]>([]);
    const [tradePairSelected, setTradePairSelected] = useState<any>({});
    const [tradePairCode, setTradePairCode] = useState<string>('METH_MUSDT');
    const [showTradingList, setShowTradingList] = useState<boolean>(false);
    const [sellBuyTab, setSellBuyTab] = useState<string>('sell');
    const [assetSymbolInputVal, setAssetSymbolInputVal] = useState<number>();
    const [coinSymbolInputVal, setCoinSymbolInputVal] = useState<number>();
    const [userOpenOrdersList, setUserOpenOrdersList] = useState<any[]>([]);
    const [userDealHistoryList, setUserDealHistoryList] = useState<any[]>([]);
    const [dealHistoryList, setDealHistoryList] = useState<any[]>([]);
    const [depthList, setDepthList] = useState<any>({});
    const [refresh, setRefresh] = useState<boolean>(false);

    const {
        getTradePairData,
        getDealHistoryData,
        getDepthData,
        getUserDealHistoryData,
        getUserOpenOrdersData,
        buyTradeOpt,
        sellTradeOpt
    } = ServerApi
    const handleSelectTradePair = async (data) => {
        setTradePairSelected(data);
        setTradePairCode(data.tradePairCode)
        setCoinSymbolInputVal(data.latestDealPriceValue)
        StorageHelper.setItem('tradePairCode', data.tradePairCode)
        setShowTradingList(false)
    }

    useEffect(() => {
        const initData = async () => {
            try {
                const tradePairCodeStorage = StorageHelper.getItem('tradePairCode')
                setOrderTabList([
                    {id: 'current position', name: '当前持仓', val: -1},
                    {id: 'Order', name: '订单', val: 0},
                    {id: 'make a deal', name: '成交', val: 0},
                    {id: 'to pay', name: '支付', val: 0}
                ])
                const tradePairData = await getTradePairData({"coinSymbol": "MUSDT"})
                tradePairData.data.list.forEach((item: any) => {
                    item.assetSymbolDecimal = item.assetSymbol.split(',')[1]
                    item.assetSymbolVal = item.assetSymbol.split(',')[0]
                    item.coinSymbolDecimal = item.coinSymbol.split(',')[1]
                    item.coinSymbolVal = item.coinSymbol.split(',')[0]
                    if (item.tradePairCode === tradePairCodeStorage) {
                        setTradePairSelected(item)
                        setCoinSymbolInputVal(item.latestDealPriceValue)
                        setTradePairCode(item.tradePairCode)
                    }
                })
                setTradePairList(tradePairData.data.list)
                if(!tradePairCodeStorage){
                    setTradePairSelected(tradePairData.data.list[0])
                    setCoinSymbolInputVal(tradePairData.data.list[0].latestDealPriceValue)
                    setTradePairCode(tradePairData.data.list[0].tradePairCode)
                    StorageHelper.setItem('tradePairCode', tradePairData.data.list[0].tradePairCode)
                }

            } catch (e) {
                console.log(e)
            }

        }
        void initData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        const initData = async () => {
            try {
                const dealHistoryData = await getDealHistoryData({tradePairCode: tradePairCode, size: 100})
                setDealHistoryList(dealHistoryData.data.list)

                const depthData = await getDepthData({tradePairCode: tradePairCode, size: 100})
                setDepthList(depthData.data)
                const walletAddress = StorageHelper.getItem('walletAddress')
                if (account.name || walletAddress) {
                    const userOpenOrdersData = await getUserOpenOrdersData({
                        account: account.name?account.name:walletAddress,
                        tradePairCode: tradePairCode,
                        size: 100
                    })
                    setUserOpenOrdersList(userOpenOrdersData.data.list)

                    const userDepthData = await getUserDealHistoryData({
                        account: account.name?account.name:walletAddress,
                        tradePairCode: tradePairCode,
                        size: 100
                    })
                    setUserDealHistoryList(userDepthData.data.list)
                    setOrderTabList([
                        {id: 'current position', name: '当前持仓', val: -1},
                        {id: 'Order', name: '订单', val: userOpenOrdersData.data.list.length},
                        {id: 'make a deal', name: '成交', val: userDepthData.data.list.length},
                        {id: 'to pay', name: '支付', val: 0}
                    ])
                }
            } catch (e) {
                console.log(e)
            }

        }
        if (tradePairCode) {
            void initData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tradePairCode, account.name,refresh])


    const inputAssetSymbolValChange = useCallback(
        (e) => {
            const value = e?.target?.value ?? ''
            setAssetSymbolInputVal(value)

        },
        []
    )

    const inputCoinSymbolValChange = useCallback(
        (e) => {
            const value = e?.target?.value ?? ''
            setCoinSymbolInputVal(value)

        },
        []
    )
    const handleTrade = async () => {
        console.log('sssss')
        try {
            if(assetSymbolInputVal>0 && coinSymbolInputVal>0){
                if (sellBuyTab === 'sell') {
                    const sellParams = {
                        user: account.name,
                        sympair_id: tradePairSelected.symbolId,
                        quantity: `${$toFixed(assetSymbolInputVal, tradePairSelected.assetSymbolDecimal)} ${tradePairSelected.assetSymbolVal}`,
                        price: `${$toFixed(coinSymbolInputVal, tradePairSelected.coinSymbolDecimal)} ${tradePairSelected.coinSymbolVal}`,
                        ext_id: 2
                    }

                    const transferParams = {
                        from: account.name,
                        to: process.env.REACT_APP_CONTRACT_DEX,
                        quantity: `${$toFixed(assetSymbolInputVal, tradePairSelected.assetSymbolDecimal)} ${tradePairSelected.assetSymbolVal}`,
                        memo: ''
                    }
                    await sellTradeOpt(sellParams, transferParams)
                    setRefresh(!refresh)
                } else {
                    const buyParams = {
                        user: account.name,
                        sympair_id: tradePairSelected.symbolId,
                        quantity: `${$toFixed(assetSymbolInputVal, tradePairSelected.assetSymbolDecimal)} ${tradePairSelected.assetSymbolVal}`,
                        price: `${$toFixed(coinSymbolInputVal, tradePairSelected.coinSymbolDecimal)} ${tradePairSelected.coinSymbolVal}`,
                        ext_id: 2
                    }

                    const transferParams = {
                        from: account.name,
                        to: process.env.REACT_APP_CONTRACT_DEX,
                        quantity: `${$toFixed($times(coinSymbolInputVal, assetSymbolInputVal), tradePairSelected.coinSymbolDecimal)} ${tradePairSelected.coinSymbolVal}`,
                        memo: ''
                    }
                    await buyTradeOpt(buyParams, transferParams)
                    setRefresh(!refresh)
                }
            }


        } catch (e) {
            console.log(e)
        }

    }
    return (
        <div className='mp-home-container'>
            <div className='trading-pair-details flex-row-between-center'>
                <div className='flex-row-start-center c-fff p-l-12' onClick={() => setShowTradingList(true)}>
                    <Icon src={eth} width='0.48rem'></Icon>
                    <div className='m-l-12 m-r-16'>
                        <p className='fw-600 fs-14'>{tradePairSelected.assetSymbolVal}</p>
                        <p className='c-6f6e84 fs-12 m-t-8'>{tradePairSelected.assetSymbolVal}-{tradePairSelected.coinSymbolVal}</p>
                    </div>
                    <Icon src={icon_down_arrow} width='0.12rem'></Icon>
                </div>
                <div className='line'></div>
                <div className='t-right c-fff m-r-12'>
                    <p className='fw-600 fs-16'>${tradePairSelected.latestDealPriceValue}</p>
                    <p className='m-t-6'>{tradePairSelected.changeRate ? tradePairSelected.changeRate : '-'}</p>
                </div>
            </div>
            {showTradingList && <div className='trading-pair-select-list'>
                {tradePairList.map((item: any) => {
                    return <div className='trading-pair-item flex-row-between-center' key={item.symbolId}
                                onClick={() => handleSelectTradePair(item)}>
                        <div className='flex-row-start-center'>
                            <Icon src={eth} width='24px'></Icon>
                            <p className='m-l-12 fs-16'>{item.assetSymbolVal}-{item.coinSymbolVal}</p>
                        </div>
                        <div className='flex-col-center-end'>
                            <p>${item.latestDealPriceValue}</p>
                            <p className='c-ff5353 m-t-8'>{item.changeRate}%</p>
                        </div>
                    </div>
                })}
                <div className='bottom-opt flex-row-start-center c-fff p-l-18'>
                    <Icon src={icon_close} width='0.48rem' onClick={() => setShowTradingList(false)}></Icon>
                    <div className='line m-l-18 m-r-18'></div>
                    <p>选择市场</p>
                </div>
            </div>}
            {tabVal === 'account' && <div className='account-content fs-16'>
                <div className='trade-opt-content'>
                    <div className='sell-buy-tab'>
                        <div className={`item ${sellBuyTab === 'sell' && 'active'}`}
                             onClick={() => setSellBuyTab('sell')}>卖出
                        </div>
                        <div className={`item ${sellBuyTab === 'buy' && 'active'}`}
                             onClick={() => setSellBuyTab('buy')}>买入
                        </div>
                    </div>
                    <div className='flex-row-start-center m-t-12'>
                        <p>数额</p>
                        <p className='m-l-6 c-6f6e84'>设置订单规模</p>
                    </div>
                    <div className='flex-row-start-center m-t-12'>
                        <div className='input-content flex-auto'>
                            <input inputMode="decimal" value={assetSymbolInputVal}
                                   onChange={inputAssetSymbolValChange}
                                   className='w-100' placeholder="0.0000"
                            />
                        </div>
                        <div className='m-l-6 usd-big-btn'>{tradePairSelected.assetSymbolVal}</div>
                    </div>
                    <div className='flex-row-start-center m-t-12'>
                        <p>限价</p>
                        <div className='m-l-6 usd-btn'>{tradePairSelected.coinSymbolVal}</div>
                    </div>
                    <div className='input-content m-t-8'>
                        <input inputMode="decimal" className='w-100' value={coinSymbolInputVal}
                               onChange={inputCoinSymbolValChange} placeholder="0.0000"
                        />
                    </div>
                    <div className='total-content m-t-12 p-t-12'>

                        <div className='flex-row-between-center p-0-12'>
                            <p>合计</p>
                            <p>{sellBuyTab==='sell'?assetSymbolInputVal?`${assetSymbolInputVal} ${tradePairSelected.assetSymbolVal}`:'-':assetSymbolInputVal && coinSymbolInputVal?`${$times(assetSymbolInputVal,coinSymbolInputVal)} ${tradePairSelected.coinSymbolVal}`:'-'}</p>
                        </div>
                        <div className='submit-btn m-t-16' onClick={() => handleTrade()}>下限价订单</div>
                    </div>

                </div>
            </div>}

            {tabVal === 'handicap' && <div className='handicap-content fs-13'>
                <div className='w-100 flex-row-between-center p-10-0'>
                    <div className='t-left w-32'>买价</div>
                    <div className='flex-row-center-center w-32'>数量
                        <div className='usd-btn'>ETH</div>
                    </div>
                    <div className='t-right w-32'>卖价格</div>
                </div>
                <div className='w-100 flex-row-between p-10-0'>
                    <div className='w-50'>
                        {depthList.buyList.map((item:any, index:number) => {
                            return (
                                <div className='w-100 flex-row-between-center p-10-0' key={index}
                                     style={{height: '20px'}}>
                                    <div className='t-left w-40'>{item.score}</div>
                                    <div className='t-right w-40'>
                                        {item.value}
                                    </div>
                                    <div className='green-line'></div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='w-50'>
                        {depthList.sellList.map((item:any, index:number) => {
                            return (
                                <div className='w-100 flex-row-between-center p-10-0' key={index}
                                     style={{height: '20px'}}>
                                    <div className='red-line'></div>
                                    <div className='t-left w-40'>
                                        {item.score}
                                    </div>
                                    <div className='t-right w-40'>{item.value}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>}

            {tabVal === 'order' && <div className='order-content fs-13'>
                <div className='w-100 flex-row-between-center p-10-0'>
                    <div className='flex-row-end-center w-32'>数量
                        <div className='usd-btn'>ETH</div>
                    </div>
                    <div className='flex-row-center-center w-32'>价格
                        <div className='usd-btn'>USD</div>
                    </div>
                    <div className='t-right w-32'>时间</div>
                </div>
                <div>
                    {dealHistoryList.map(item => {
                        return (
                            <div className='w-100 flex-row-between-center' key={item.id} style={{height: '20px'}}>
                                <div className='red-line'></div>
                                <div className='t-right w-32'>{item.dealValue}</div>
                                <div className='flex-row-center-center w-32'>
                                    <p>{item.dealPriceValue}</p>
                                </div>
                                <div
                                    className='t-right w-32'>{dayjs(item.dealTime).format('YYYY-MM-DD HH:mm:ss').split(' ')[1]}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>}
            {tabVal === 'price' && <TVChartContainer/>}
            <div className='flex-row-between-center fs-13 c-6f6e84 p-l-12 p-r-12 m-t-8'>
                <div className={`flex-col-center-center ${tabVal === 'account' ? 'tab-bg-check' : 'tab-bg'}`}
                     onClick={() => setTabVal('account')}>
                    <Icon src={tabVal === 'account' ? icon_account_check : icon_account} height="0.44rem"></Icon>
                    <p className='m-t-8'>账户</p>
                </div>
                <div className={`flex-col-center-center ${tabVal === 'price' ? 'tab-bg-check' : 'tab-bg'}`}
                     onClick={() => setTabVal('price')}>
                    <Icon src={tabVal === 'price' ? icon_price_check : icon_price} height="0.52rem"></Icon>
                    <p className='m-t-8'>价格</p>
                </div>
                <div className={`flex-col-center-center ${tabVal === 'handicap' ? 'tab-bg-check' : 'tab-bg'}`}
                     onClick={() => setTabVal('handicap')}>
                    <Icon src={tabVal === 'handicap' ? icon_handicap_check : icon_handicap} height="0.52rem"></Icon>
                    <p className='m-t-8'>盘口</p>
                </div>
                <div className={`flex-col-center-center ${tabVal === 'order' ? 'tab-bg-check' : 'tab-bg'}`}
                     onClick={() => setTabVal('order')}>
                    <Icon src={tabVal === 'order' ? icon_order_check : icon_order} height="0.4rem"></Icon>
                    <p className='m-t-8'>交易订单</p>
                </div>
            </div>

            <div className='w-100 m-t-8' style={{borderRight: '1px solid #2d2d3d'}}>
                <div className='tab-list'>
                    {
                        orderTabList.map(item => {
                            return <div
                                className={`tab-item flex-row-center-center ${item.id === orderTab && 'active'}`}
                                key={item.id}
                                onClick={() => setOrderTab(item.id)}>
                                <p>{item.name}</p>
                                {item.val > -1 && <div className='num-btn'>{item.val}</div>}
                            </div>
                        })
                    }
                </div>
                <div className='flex-row-between-center p-16 fs-13'>
                    <div className='t-left w-32'>
                        <p className='c-fff'>状态</p>
                        <p className='c-6f6e84 m-t-6'>详情</p>
                    </div>
                    <div className='t-right w-32'>
                        <p className='c-fff'>数额</p>
                        <p className='c-6f6e84 m-t-6'>已全部成交</p>
                    </div>
                    <div className='t-right w-32'>
                        <p className='c-fff'>价格</p>
                        <p className='c-6f6e84 m-t-6'>触发器</p></div>
                </div>
                <div className='p-16'>
                    {orderTab === 'Order' && userOpenOrdersList.map((item:any) => {
                        return <div className='card-item flex-row-between-center'>
                            <div className='t-left w-32'>
                                <p className='c-fff'>{item.orderSide==='buy'?'买入':'卖出'}</p>
                                <p className='c-6f6e84 m-t-6'>限价</p>
                            </div>
                            <div className='t-right w-32'>
                                <p className='c-fff'>{item.limitAssetValue} {item.orderSide==='sell'?item.matchedCoinSymbol.split(',')[0]:item.matchedAssetSymbol.split(',')[0]}</p>
                                <p className='c-6f6e84 m-t-6'>{item.matchedCoinValue} {item.orderSide==='sell'?item.matchedCoinSymbol.split(',')[0]:item.matchedAssetSymbol.split(',')[0]}</p>
                            </div>
                            <div className='t-right w-32'>
                                <p className='c-fff'>{item.priceValue}</p>
                                <p className='c-6f6e84 m-t-6'>-</p>
                            </div>
                        </div>
                    })

                    }

                    {orderTab === 'make a deal' && userDealHistoryList.map((item:any) => {
                        return <div className='card-item flex-row-between-center'>
                            <div className='t-left w-32'>
                                <p className='c-fff'>{item.orderSide==='buy'?'买入':'卖出'}</p>
                                <p className='c-6f6e84 m-t-6'>限价</p>
                            </div>
                            <div className='t-right w-32'>
                                <p className='c-fff'>{item.limitAssetValue} {item.orderSide==='sell'?item.matchedAssetSymbol.split(',')[0]:item.matchedCoinSymbol.split(',')[0]}</p>
                                <p className='c-6f6e84 m-t-6'>{item.matchedAssetValue} {item.orderSide==='sell'?item.matchedAssetSymbol.split(',')[0]:item.matchedCoinSymbol.split(',')[0]}</p>
                            </div>
                            <div className='t-right w-32'>
                                <p className='c-fff'>{item.priceValue}</p>
                                <p className='c-6f6e84 m-t-6'>-</p>
                            </div>
                        </div>
                    })

                    }
                </div>
            </div>
        </div>
    )
}

export default Baseweb(memo(Home))
