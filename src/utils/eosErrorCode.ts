const eosErrorArray = {
    3000000: {
        'en': 'blockchain exception',
        'zh-CN': '区块链异常'
    },
    3010000: {
        'en': 'blockchain exception',
        'zh-CN': '区块链异常'
    },
    3010001: {
        'en': 'blockchain exception',
        'zh-CN': '区块链异常'
    },
    3010002: {
        'en': 'blockchain exception',
        'zh-CN': '区块链异常'
    },
    3010003: {
        'en': 'blockchain exception',
        'zh-CN': '区块链异常'
    },
}

export const EosErrorCodeHelper = {
    getEOSErrorMessage: (code: number, lange: string) => {
        return eosErrorArray[code][lange];
    }
}

