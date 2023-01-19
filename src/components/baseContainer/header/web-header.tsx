import React, {memo, useEffect, useState} from 'react'
import Icon from "@/components/Icon";
import amax_logo from "@/assets/images/common/amax_logo.png";
import icon_connect from "@/assets/images/common/icon_connect.png";
import {Link} from 'react-router-dom';
import {useTranslation} from "react-i18next";
import {languages} from '@/locale'
import {StorageHelper} from "@/utils/storage";
import {getUserInfo} from "@/state/base/reducer";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "@/state";

interface IWebHeaderProps {
    pagename?: string
}

const WebHeader: React.FunctionComponent<IWebHeaderProps> = (props) => {

    const {i18n} = useTranslation()
    const dispatch = useDispatch();
    const {account} = useSelector((state: AppState) => state.baseInfo);
    const [accountVal, setAccountVal] = useState<string>();

    useEffect(() => {
        if (account.name) {
            setAccountVal(account.name)
        } else {
            if (StorageHelper.getItem('walletAddress')) {
                setAccountVal(StorageHelper.getItem('walletAddress'))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account.name, StorageHelper.getItem('walletAddress')])
    const changeLang = (code: string): void => {
        StorageHelper.setItem('lange', code)
        i18n.changeLanguage(code).catch(() => {
        })
    }
    return (
        <header className="web-header flex-row-between-center">
            <Link to="/">
                <div className='flex-row-start-center'>
                    <Icon src={amax_logo} height="28px"></Icon>
                    <p className='c-fff m-l-8 fs-18'>fufi.exchange</p>
                </div>

            </Link>
            <div className='flex-row-end-center'>
                <a href='https://www.amaxscan.io/' target='_blank' className='pointer'
                   rel='noreferrer'>区块链浏览器</a>
                <div className='flex-row-end-center m-l-12 pointer'>
                    <p onClick={() => dispatch(getUserInfo())}>{accountVal ? accountVal : 'AMAX钱包'}</p>
                    <Icon src={icon_connect} height="22px" className='m-l-4'></Icon>

                </div>
                <div className='flex-row-center-center web-header-nav-dropdown m-l-28 p-l-28 h-100'
                     style={{borderLeft: '1px solid #4a5570'}}>
                    <p>{languages && languages.find(i => i.value === i18n.language)?.label}</p>
                    <div className='arrow-down'></div>
                    <div className="web-header-nav-dropdown-menu">
                        <ul className="c-fff p-5-0">
                            {
                                languages.map(({label, value}) => {
                                    return (
                                        <li onClick={() => changeLang(value)} key={value}>{label}</li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default memo(WebHeader)
