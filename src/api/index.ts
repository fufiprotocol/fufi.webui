import axiosRequest from '@/api/axiosRequest'
import {transact} from "@/utils/transact";
export interface GetCurrencyBalanceParams {
  tokenContract: string,
  account: string | number,
  tokenSymbol: string | number
}


const {post} = axiosRequest

class ServerApi {
    private readonly baseConfig = {
        amaxNodeApi: `${process.env.REACT_APP_URL}/v1/chain/get_table_rows`,
        dexApi:`${process.env.REACT_APP_DEX}/dex`
    }

    getSympairData = async (id:string)=>{
        const data = await post(this.baseConfig.amaxNodeApi, {
            code: process.env.REACT_APP_CONTRACT_DEX,
            scope: process.env.REACT_APP_CONTRACT_DEX,
            table: 'sympair',
            index_position: 1,
            key_type: 'i64',
            lower_bound: id,
            upper_bound: id,
            json: true
        })
        return data
    }

    getKLineData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/kline`, params)
        return data
    }
    getTradePairData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/tradePair`, params)
        return data
    }
    getDealHistoryData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/dealHistory`, params)
        return data
    }
    getUserOpenOrdersData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/user/openOrders`, params)
        return data
    }
    getUserDealHistoryData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/user/dealHistory`, params)
        return data
    }
    getDepthData = async (params:any)=>{
        const data = await post(`${this.baseConfig.dexApi}/depth`, params)
        return data
    }

    buyTradeOpt = async (buyParams:any,transferParams:any)=> {
        return await transact([{
            contract: process.env.REACT_APP_CONTRACT_DEX,
            name: 'buy',
            data: buyParams,
        },{
            contract: process.env.REACT_APP_CONTRACT_TOKEN,
            name: 'transfer',
            data: transferParams,
        }]);
    }

    sellTradeOpt = async (sellParams:any,transferParams:any)=> {
        return await transact([{
            contract: process.env.REACT_APP_CONTRACT_DEX,
            name: 'sell',
            data: sellParams,
        },{
            contract: process.env.REACT_APP_CONTRACT_TOKEN,
            name: 'transfer',
            data: transferParams,
        }]);
    }
}

export default new ServerApi()
