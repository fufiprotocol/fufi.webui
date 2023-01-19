import {FunctionComponent, lazy, LazyExoticComponent} from 'react'

interface IRouterConfig {
    path: string
    component: LazyExoticComponent<FunctionComponent<any>> | undefined
    mpComponent: LazyExoticComponent<FunctionComponent<any>> | undefined
    exact?: boolean
}

const routerConfig: IRouterConfig[] = [
    {
        // 首页
        path: '/',
        component: lazy(async () => await import('@/views/web/Home/index')),
        mpComponent: lazy(async () => await import('@/views/mobile/Home/index')),
        exact: true
    }
]

export default routerConfig
