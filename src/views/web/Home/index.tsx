import React, {FC, memo, ReactElement, useCallback, useEffect, useState} from "react";
import Baseweb from "@/components/baseContainer/webwrap";
import "./index.scss";
import {TVChartContainer} from "@/components/TradingView";
import Icon from "@/components/Icon";
import eth from "@/assets/images/common/eth.svg";
import icon_down_arrow from "@/assets/images/common/icon_down_arrow.svg";
import ServerApi from '@/api'
import dayjs from "dayjs";
import {StorageHelper} from "@/utils/storage";
import {useSelector} from "react-redux";
import {AppState} from "@/state";
import {$times, $toFixed} from "@/utils";
import io from 'socket.io-client';
const priceTabList = [
    {id: 'Limit Order', name: '限价单'},
    {id: 'Market Order', name: '市价单'}
]

const volumeTabList = [
    {id: 'Change', name: '盘口'},
    {id: 'Volume', name: '交易订单'}
]
const Home: FC = (): ReactElement => {
    const {account} = useSelector((state: AppState) => state.baseInfo);
    const [orderTabList, setOrderTabList] = useState<any[]>([]);
    const [priceTab, setPriceTab] = useState<string>('Limit Order');
    const [orderTab, setOrderTab] = useState<string>('Order');
    const [volumeTab, setVolumeTab] = useState<string>('Change');
    const [sellBuyTab, setSellBuyTab] = useState<string>('sell');
    const [tradePairList, setTradePairList] = useState<any[]>([]);
    const [tradePairSelected, setTradePairSelected] = useState<any>({});
    const [tradePairCode, setTradePairCode] = useState<string>('');
    const [dealHistoryList, setDealHistoryList] = useState<any[]>([]);
    const [depthList, setDepthList] = useState<any>({});
    const {
        getTradePairData,
        getDealHistoryData,
        getDepthData,
        getUserDealHistoryData,
        getUserOpenOrdersData,
        buyTradeOpt,
        sellTradeOpt
    } = ServerApi
    const [showTradingList, setShowTradingList] = useState<boolean>(false);
    const [assetSymbolInputVal, setAssetSymbolInputVal] = useState<number>();
    const [coinSymbolInputVal, setCoinSymbolInputVal] = useState<number>();
    const [userOpenOrdersList, setUserOpenOrdersList] = useState<any[]>([]);
    const [userDealHistoryList, setUserDealHistoryList] = useState<any[]>([]);
    const [refresh, setRefresh] = useState<boolean>(false);
    useEffect(() => {

        let socket = null;

        if(tradePairCode){
            const socketOptions = {
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 1000,
                reconnectionAttempts: 1,
                query: {
                    "tradePairCode": tradePairCode,
                    "account": account.name
                },
                transports: ['websocket', 'polling']
            }
            socket = io(process.env.REACT_APP_SOCKET, socketOptions);
            socket.on("MESSAGE", (res: any) => {
                console.log('修改了 --openOrders--');
                console.log('res:',res)

            });
            socket.on("ping", () => {
                console.log('修改了 --ping--');
                socket.emit('pong','pong')
            });
        }
        console.log('修改了 ----');

        return () => {
            console.log('断开')
            if(socket){
                socket.off('MESSAGE')
                socket.off('ping')
                socket.disconnect()
            }

        };
    }, [tradePairCode, account.name]);
    useEffect(() => {
        const initData = async () => {
            try {
                const tradePairCodeStorage = StorageHelper.getItem('tradePairCode')
                if(tradePairCodeStorage){
                    setTradePairCode(tradePairCodeStorage)
                }
                setPriceTab('Limit Order')
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
                if (!tradePairCodeStorage) {
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
                const dealHistoryData = await getDealHistoryData({tradePairCode: tradePairCode, size: 100})
                setDealHistoryList(dealHistoryData.data.list)

                const depthData = await getDepthData({tradePairCode: tradePairCode, size: 100})
                setDepthList(depthData.data)
                const walletAddress = StorageHelper.getItem('walletAddress')
                if (account.name || walletAddress) {
                    const userOpenOrdersData = await getUserOpenOrdersData({
                        account: account.name ? account.name : walletAddress,
                        tradePairCode: tradePairCode,
                        size: 100
                    })
                    setUserOpenOrdersList(userOpenOrdersData.data.list)

                    const userDepthData = await getUserDealHistoryData({
                        account: account.name ? account.name : walletAddress,
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
    }, [tradePairCode, account.name, refresh])

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

    const handleBuyOrSellTabSelect = async (tabVal: any) => {
        setSellBuyTab(tabVal)
        setAssetSymbolInputVal(0)
    }

    const handleTrade = async () => {
        try {
            if(assetSymbolInputVal>0 && coinSymbolInputVal>0){
                if (sellBuyTab === 'sell') {
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
                        quantity: `${$toFixed(assetSymbolInputVal, tradePairSelected.assetSymbolDecimal)} ${tradePairSelected.assetSymbolVal}`,
                        memo: ''
                    }
                    await sellTradeOpt(buyParams, transferParams)
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
        <div className='web-home-container'>

            <div className='trading-pair-details'>
                {showTradingList ?
                    <div className='trading-pair flex-row-between-center' onClick={() => setShowTradingList(false)}>
                        <div className='flex-row-start-center'>
                            选择市场
                        </div>
                        <div className='flex-row-end-center'>

                            <p className='m-r-12 fs-14 c-6f6e84'>点击关闭</p>
                            <Icon src={icon_down_arrow} width='6px' className='transform180'></Icon>
                        </div>
                    </div> :
                    <div className='trading-pair flex-row-between-center' onClick={() => setShowTradingList(true)}>
                        <div className='flex-row-start-center'>
                            <Icon src={eth} width='24px'></Icon>
                            <p className='m-l-12'>{tradePairSelected.assetSymbolVal}-{tradePairSelected.coinSymbolVal}</p>
                        </div>
                        <div className='flex-row-end-center'>

                            <p className='m-r-12 fs-14 c-6f6e84'>交易对</p>
                            <Icon src={icon_down_arrow} width='6px'></Icon>
                        </div>
                    </div>}

                <div className='flex-row-start-center'>
                    <div className='p-0-16 fs-18 c-ff5353'>
                        ${tradePairSelected.latestDealPriceValue}
                    </div>
                    <div className='line'></div>
                    <div className='p-0-12'>
                        <p className='fs-13'>24小时交易量</p>
                        <p className='fs-12 c-fff m-t-6'>${tradePairSelected.volume}</p>
                    </div>
                    <div className='line'></div>
                </div>

            </div>
            <div className='flex w-100 h-100' style={{position: 'relative'}}>
                {showTradingList && <div
                    className='trading-pair-data flex-row-between-center'>
                    <div className='trading-pair-list'>
                        {tradePairList.map((item: any) => {
                            return <div key={item.symbolId} onClick={() => handleSelectTradePair(item)}
                                        className='trading-pair-item flex-row-between-center'>
                                <div className='flex-row-start-center'>
                                    <Icon src={eth} width='24px'></Icon>
                                    <p className='m-l-12 fs-16'>{item.assetSymbolVal}-{item.coinSymbolVal}</p>
                                </div>
                                <div className='flex-col-center-end'>
                                    <p>${item.bottomPrice}</p>
                                    <p className='c-ff5353 m-t-8'>{item.changeRate}%</p>
                                </div>
                            </div>
                        })
                        }
                    </div>
                    <div className='trading-pair-blur'></div>
                </div>
                }

                <div className='trade-side' style={{marginTop: '24px'}}>
                    <div className='tab-list'>
                        {
                            priceTabList.map(item => {
                                return <div style={{width: '50%'}}
                                            className={`tab-item flex-row-center-center ${item.id === priceTab && 'active'}`}
                                            key={item.id}
                                >{item.name}</div>
                            })
                        }
                    </div>
                    <div className='trade-opt-content'>
                        <div className='sell-buy-tab'>
                            <div className={`item ${sellBuyTab === 'sell' && 'active'}`}
                                 onClick={() => handleBuyOrSellTabSelect('sell')}>卖出
                            </div>
                            <div className={`item ${sellBuyTab === 'buy' && 'active'}`}
                                 onClick={() => handleBuyOrSellTabSelect('buy')}>买入
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
                                <p>{sellBuyTab === 'sell' ? assetSymbolInputVal>0 ? `${assetSymbolInputVal} ${tradePairSelected.assetSymbolVal}` : '-' : assetSymbolInputVal>0 && coinSymbolInputVal>0 ? `${$times(assetSymbolInputVal, coinSymbolInputVal)} ${tradePairSelected.coinSymbolVal}` : '-'}</p>
                            </div>
                            <div className='submit-btn m-t-16' onClick={() => handleTrade()}>下限价订单</div>
                        </div>

                    </div>

                </div>
                <div className='trade-side'>
                    <div className='tab-list'>
                        {
                            volumeTabList.map(item => {
                                return <div style={{width: '50%'}}
                                            className={`tab-item flex-row-center-center ${item.id === volumeTab && 'active'}`}
                                            key={item.id}
                                            onClick={() => setVolumeTab(item.id)}>{item.name}</div>
                            })
                        }
                    </div>

                    <div className='w-100 flex-row-between-center p-10-0'>
                        <div className='flex-row-end-center w-32'>数量
                            <div className='usd-btn'>{tradePairSelected.assetSymbolVal}</div>
                        </div>
                        <div className='flex-row-center-center w-32'>价格
                            <div className='usd-btn'>{tradePairSelected.coinSymbolVal}</div>
                        </div>
                        <div className='t-right w-32 p-r-10'>{volumeTab === 'Volume' ? '时间' : '我的订单'}</div>
                    </div>
                    {volumeTab === 'Change' && <div className='h-100'>
                        <div style={{height: 'calc(50% - 17px)', overflow: 'hidden'}}>
                            {depthList.buyList?.map((item: any, index: number) => {
                                return (
                                    <div className='w-100 flex-row-between-center p-10-0' key={index}
                                         style={{height: '20px'}}>
                                        <div className='red-line'></div>
                                        <div className='flex-row-end-center w-32'>{item.score}</div>
                                        <div className='flex-row-center-center w-32'>{item.value}</div>
                                        <div className='flex-row-center-center w-32'>-
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className='price-value w-100 flex-row-between-center' style={{display: 'none'}}>
                            <div className='flex-row-end-center w-32'>点差</div>
                            <div className='flex-row-center-center w-32'>0.1</div>
                            <div className='flex-row-center-center w-32'>0.01%</div>
                        </div>
                        <div style={{height: 'calc(50% - 17px)', overflow: 'hidden'}}>
                            {depthList.sellList?.map((item: any, index: number) => {
                                return (
                                    <div className='w-100 flex-row-between-center p-10-0' key={index}
                                         style={{height: '20px'}}>
                                        <div className='green-line'></div>
                                        <div className='flex-row-end-center w-32'>{item.score}</div>
                                        <div className='flex-row-center-center w-32'>{item.value}</div>
                                        <div className='flex-row-center-center w-32'>-
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>}
                    {volumeTab === 'Volume' && <div>
                        {dealHistoryList.map((item: any) => {
                            return (
                                <div className='w-100 flex-row-between-center p-10-0' key={item.id}
                                     style={{height: '20px'}}>
                                    <div className='red-line'></div>
                                    <div className='flex-row-end-center w-32'>{item.dealValue}</div>
                                    <div className='flex-row-center-center w-32'>{item.dealPriceValue}</div>
                                    <div
                                        className='flex-row-center-center w-32'>{dayjs(item.dealTime).format('YYYY-MM-DD HH:mm:ss').split(' ')[1]}
                                    </div>
                                </div>
                            )
                        })}

                    </div>}
                </div>
                <div className='flex-auto  h-100'
                     style={{borderRight: '1px solid #2d2d3d'}}>
                    <div className='center-content'>
                        <TVChartContainer/>
                    </div>

                    <div className='flex w-100 bottom-content'>
                        <div className='flex-auto w-100' style={{borderRight: '1px solid #2d2d3d'}}>
                            <div className='tab-list'>
                                {
                                    orderTabList.map(item => {
                                        return <div
                                            className={`tab-item p-0-24 flex-row-center-center ${item.id === orderTab && 'active'}`}
                                            key={item.id}
                                            onClick={() => setOrderTab(item.id)}>
                                            <p>{item.name}</p>
                                            {item.val > -1 && <div className='num-btn'>{item.val}</div>}
                                        </div>
                                    })
                                }
                            </div>

                            {orderTab === 'Order' &&
                                <>
                                    <div className="w-100 fs-14 flex-row-between-center" style={{
                                        borderBottom: '1px solid #2d2d3d',
                                        height: '40px',
                                        lineHeight: '40px',
                                        padding: '0 24px'
                                    }}>
                                        <div style={{width: '40%'}}>交易哈希</div>
                                        <div style={{width: '10%'}} className='t-center'>交易对</div>
                                        <div style={{width: '10%'}} className='t-center'>方向</div>
                                        <div style={{width: '10%'}} className='t-center'>价格</div>
                                        <div style={{width: '10%'}} className='t-center'>数量</div>
                                        <div style={{width: '10%'}} className='t-center'>已成交</div>
                                        <div style={{width: '10%'}}>操作</div>
                                    </div>
                                    {userOpenOrdersList.map((item: any) => {
                                        return <div key={item.id} className='flex-row-between-center c-fff' style={{
                                            borderBottom: '1px solid #2d2d3d',
                                            height: '40px',
                                            lineHeight: '40px',
                                            padding: '0 24px'
                                        }}>
                                            <div style={{width: '40%'}}>{item.txHash}</div>
                                            <div style={{width: '10%'}} className='t-center'>{item.tradePairCode}</div>
                                            <div style={{width: '10%'}}
                                                 className='t-center'>{item.orderSide === 'sell' ? '卖出' : '买入'}</div>
                                            <div style={{width: '10%'}} className='t-center'>{item.priceValue}</div>
                                            <div style={{width: '10%'}}
                                                 className='t-center'>{item.limitAssetValue} {item.orderSide === 'sell' ? item.matchedCoinSymbol.split(',')[0] : item.matchedAssetSymbol.split(',')[0]}</div>
                                            <div style={{width: '10%'}}
                                                 className='t-center'>{item.matchedCoinValue} {item.orderSide === 'sell' ? item.matchedCoinSymbol.split(',')[0] : item.matchedAssetSymbol.split(',')[0]}</div>
                                            <div style={{width: '10%'}}>操作</div>
                                        </div>
                                    })}
                                </>
                            }
                            {orderTab === 'make a deal' && <>
                                <div className="w-100 fs-14 flex-row-between-center" style={{
                                    borderBottom: '1px solid #2d2d3d',
                                    height: '40px',
                                    lineHeight: '40px',
                                    padding: '0 24px'
                                }}>
                                    <div style={{width: '40%'}}>交易哈希</div>
                                    <div style={{width: '10%'}} className='t-center'>交易对</div>
                                    <div style={{width: '10%'}} className='t-center'>方向</div>
                                    <div style={{width: '10%'}} className='t-center'>价格</div>
                                    <div style={{width: '10%'}} className='t-center'>数量</div>
                                    <div style={{width: '10%'}} className='t-center'>已成交</div>
                                    <div style={{width: '10%'}}>操作</div>
                                </div>
                                {userDealHistoryList.map((item: any) => {
                                    return <div key={item.id} className='flex-row-between-center c-fff' style={{
                                        borderBottom: '1px solid #2d2d3d',
                                        height: '40px',
                                        lineHeight: '40px',
                                        padding: '0 24px'
                                    }}>
                                        <div style={{width: '40%'}}>{item.txHash}</div>
                                        <div style={{width: '10%'}} className='t-center'>{item.tradePairCode}</div>
                                        <div style={{width: '10%'}}
                                             className='t-center'>{item.orderSide === 'sell' ? '卖出' : '买入'}</div>
                                        <div style={{width: '10%'}} className='t-center'>{item.priceValue}</div>
                                        <div style={{width: '10%'}}
                                             className='t-center'>{item.limitAssetValue} {item.orderSide === 'sell' ? item.matchedAssetSymbol.split(',')[0] : item.matchedCoinSymbol.split(',')[0]}</div>
                                        <div style={{width: '10%'}}
                                             className='t-center'>{item.matchedAssetValue} {item.orderSide === 'sell' ? item.matchedAssetSymbol.split(',')[0] : item.matchedCoinSymbol.split(',')[0]}</div>
                                        <div style={{width: '10%'}}>操作</div>
                                    </div>
                                })}
                            </>}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Baseweb(memo(Home));
