import React, {createElement} from 'react'
import WebHeader from './header/web-header'
import './index.scss'
import MpFooter from "@/components/baseContainer/footer/mp-footer";

const webWrap = (props: any) => {
    const {isMobile} = (window as any)._global || {}
    return (
        <>
            {
                isMobile
                    ? <div className="mp-home">
                        <div className='top-bg'></div>
                        <div className="mp-body">{props.children}</div>
                        <MpFooter/>
                    </div>
                    : <div className="web-home">
                        <WebHeader pagename={props.pagename}/>
                        <div className="web-body flex-auto">
                            {props.children}
                        </div>
                    </div>
            }
        </>

    )
}

const BasePage = (Comp: any, pagename?: string) => (props: any) => {
    return createElement(webWrap, {pagename: pagename}, createElement(Comp, {...props}))
}
export default BasePage
