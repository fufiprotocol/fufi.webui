import * as React from 'react';
import './index.scss';
import {
    widget,
    ChartingLibraryWidgetOptions,
    IChartingLibraryWidget,
} from '../../charting_library/charting_library.min'; // Make sure to folow step 1 of the README
import {
    HistoryCallback,
    LibrarySymbolInfo,
    ResolutionString,
    ResolveCallback,
} from '../../charting_library/datafeed-api';
// import {FAKE_DATA_BARS} from "@/components/TradingView/fake";
import {StorageHelper} from "@/utils/storage";
import ServerApi from "@/api";
// import ServerApi from '@/api'
// This is a basic example of how to create a TV widget
// You can add more feature such as storing charts in localStorage

export interface ChartContainerProps {
    symbol: ChartingLibraryWidgetOptions['symbol'];
    interval: ChartingLibraryWidgetOptions['interval'];
    datafeedUrl: string;
    libraryPath: ChartingLibraryWidgetOptions['library_path'];
    chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
    chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
    clientId: ChartingLibraryWidgetOptions['client_id'];
    userId: ChartingLibraryWidgetOptions['user_id'];
    fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
    autosize: ChartingLibraryWidgetOptions['autosize'];
    studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
    containerId: ChartingLibraryWidgetOptions['container_id'];
    theme: string;
}

export interface ChartContainerState {
}

const configurationData = {
    supports_search: true,
    supports_marks: true,
    intraday_multipliers: [
        '1',
        '3',
        '5',
        '15',
        '30',
        '60',
        '120',
        '240',
        '360',
        '480',
        '720',
    ],
    supported_resolutions: [
        '1',
        '3',
        '5',
        '15',
        '30',
        '60',
        '120',
        '240',
        '360',
        '480',
        '720',
        '1D',
        '3D',
        '1W',
    ],
};
export const TVChartContainer = () => {
    // @ts-ignore
    const defaultProps: ChartContainerProps = {
        symbol: 'WBTC/USDT',
        interval: '60' as ResolutionString,
        theme: 'Dark',
        containerId: 'tv_chart_container',
        chartsStorageUrl: 'https://saveload.tradingview.com',
        chartsStorageApiVersion: '1.1',
        clientId: 'tradingview.com',
        userId: 'public_user_id',
        datafeedUrl: 'http://192.168.189.22/dex/kline',
        libraryPath: '/charting_library/',
        fullscreen: false,
        autosize: true,
        studiesOverrides: {},
    };

    // const defaultProps: ChartContainerProps = {
    //   symbol: 'RAY/USDT',
    //   interval: '60',
    //   auto_save_delay: 5,
    //   theme: 'Dark',
    //   containerId: 'tv_chart_container',
    //   libraryPath: '/charting_library/',
    //   chartsStorageUrl: 'https://saveload.tradingview.com',
    //   chartsStorageApiVersion: '1.1',
    //   clientId: 'tradingview.com',
    //   userId: 'public_user_id',
    //   fullscreen: false,
    //   autosize: true,
    //   studiesOverrides: {},
    // };
    const onReady = (callback: any) => {
        setTimeout(() => callback(configurationData));
    };
    // const {
    //   getKLineData
    // } = ServerApi
    const getBars = async (
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        from: number,
        to: number,
        onResult: HistoryCallback
    ) => {
        // return FAKE_DATA_BARS;
        const {getKLineData} = ServerApi
        const klineData = await getKLineData({
            "periodCode": "1min",
            "tradePairCode": StorageHelper.getItem('tradePairCode')
        })
        let barsData = []
        if(klineData.data && klineData.data.list.length>0){
             barsData = klineData.data.list.map((item: any) => {
                return {
                    open: item.openPrice,
                    close: item.closePrice,
                    low: item.lowPrice,
                    high: item.highPrice,
                    volume: item.dealAssetValue,
                    time: item.effectTime * 1000,
                }
            })
        }

        onResult(barsData, {noData: false});
    };

    const resolveSymbol = async (
        symbolName: string,
        onSymbolResolvedCallback: ResolveCallback
        // onResolveErrorCallback: ErrorCallback,
    ) => {
        const symbol = StorageHelper.getItem('tradePairCode');
        const priceScale = 100000;
        // log(amount_precision) * (fee precision)
        const volumePrecision = -Math.log10(Number(0.01)) + 2;
        const symbolInfo: LibrarySymbolInfo = {
            format: undefined,
            exchange: '',
            full_name: '',
            listed_exchange: '',
            ticker: symbol,
            name: symbol,
            description: symbol,
            type: 'bitcoin',
            session: '24x7',
            timezone: 'Asia/Shanghai',
            minmov: 1,
            pricescale: priceScale,
            has_intraday: true,
            has_weekly_and_monthly: true,
            intraday_multipliers: ['1', '60'],
            supported_resolutions: ["1", "3", "5", "15", "30", "60", "120",   "240", "D"],
            volume_precision: volumePrecision
        };
        onSymbolResolvedCallback(symbolInfo);
    };
    const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
    const datafeed = {
        onReady,
        searchSymbols: () => {
        },
        resolveSymbol,
        getBars,
        subscribeBars: () => {
        },
        unsubscribeBars: () => {
        },
    };
    React.useEffect(() => {
        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: 'WBTCss/USDT',
            // BEWARE: no trailing slash is expected in feed URL
            // tslint:disable-next-line:no-any
            datafeed: datafeed,
            interval: defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
            container_id: defaultProps.containerId as ChartingLibraryWidgetOptions['container_id'],
            library_path: defaultProps.libraryPath as string,
            locale: 'zh',
            disabled_features: ['use_localstorage_for_settings','left_toolbar','header_undo_redo','header_indicators','header_compare'],
            enabled_features: [''],
            load_last_chart: true,
            timezone:'Asia/Shanghai',
            client_id: defaultProps.clientId,
            user_id: defaultProps.userId,
            fullscreen: defaultProps.fullscreen,
            autosize: defaultProps.autosize,
            studies_overrides: defaultProps.studiesOverrides,
            theme: 'Dark',
        };

        const tvWidget = new widget(widgetOptions);
        tvWidgetRef.current = tvWidget;

        tvWidget.onChartReady(() => {
            tvWidget.headerReady().then(() => {
                const button = tvWidget.createButton();
                button.setAttribute('title', 'Click to show a notification popup');
                button.classList.add('apply-common-tooltip');
                button.addEventListener('click', () =>
                    tvWidget.showNoticeDialog({
                        title: 'Notification',
                        body: 'TradingView Charting Library API works correctly',
                        callback: () => {
                            console.log('It works!!');
                        },
                    }),
                );
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [StorageHelper.getItem('tradePairCode')]);

    return <div id={defaultProps.containerId} className="tradingview-chart"/>;
};
