import React, {memo, useState} from 'react'
import Icon from "@/components/Icon";
import {Link} from "react-router-dom";
import amax_logo from "@/assets/images/common/amax_logo.png";
import {useDispatch} from "react-redux";
import {getUserInfo} from "@/state/base/reducer";
import ConnectModal from "@/components/ConnectModal";

interface IMpHeaderProps {
    pagename?: string
}

const MpHeader: React.FunctionComponent<IMpHeaderProps> = (props) => {
    const dispatch = useDispatch();
    const [connectVisible, setConnectVisible] = useState(false)


    const connectWallt = (connectorType:any) => {
        dispatch(getUserInfo());
    }

    return (
        <>
            <header className="mp-header flex-row-between-center">
                <Link to="/">
                    <Icon src={amax_logo} height="0.4rem"></Icon>
                </Link>
            </header>
            <ConnectModal visible={connectVisible} login={(connectorType:any)=>connectWallt(connectorType)} onDismiss={() => setConnectVisible(false)} />
        </>
    )
}

export default memo(MpHeader)
