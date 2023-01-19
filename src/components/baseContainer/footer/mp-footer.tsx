import React, {memo, useEffect, useState} from 'react'
import Icon from "@/components/Icon";
import amax_logo from "@/assets/images/common/amax_logo.png";
import {getUserInfo} from "@/state/base/reducer";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "@/state";
import {languages} from "@/locale";
import {useTranslation} from "react-i18next";
import {StorageHelper} from "@/utils/storage";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IMpFooterProps {
}

const MpFooter: React.FunctionComponent<IMpFooterProps> = (props) => {
    const {i18n} = useTranslation()
    const dispatch = useDispatch();
    const {account} = useSelector((state: AppState) => state.baseInfo);
    const [showLangList, setShowLangList] = useState<boolean>(false);
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
        setShowLangList(false)
    }
    return (
        <footer className="mp-footer flex-row-between-center">
            <div className='opt-txt flex-col-center-center'>
                <Icon src={amax_logo} height="28px"></Icon>
            </div>

            <div className='opt-txt flex-row-center-center c-fff' onClick={() => setShowLangList(true)}>
                {languages && languages.find(i => i.value === i18n.language)?.label}

            </div>
            {showLangList && <div className='mp-header-nav-dropdown'>
                <div className="mp-header-nav-dropdown-menu">
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
            </div>}
            <div className='flex-auto p-l-12 p-r-12'>
                <div className='flex-col-center-center btn'>
                    <p onClick={() => dispatch(getUserInfo())}>{accountVal ? accountVal : 'AMAX钱包'}</p>
                </div>
            </div>

        </footer>
    )
}

export default memo(MpFooter)
