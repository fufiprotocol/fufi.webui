import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from '@/state';
import { setUserInfo } from './actions';
import {network, getScatter, initLink, isAPLink, scope, verifyProof, onAppRemoveSession} from '@/utils/client'
import {StorageHelper} from '@/utils/storage';
const initialState = {
    account: {
        kyc: false,
        name: '',
        publicKey: '',
        status: 0,
    }
};

const BaseInfoSlice = createSlice({
    name: 'base',
    initialState,
    reducers: {
        setUserInfo(state, { payload: account }) {
            state.account = account;
        }
    },
});

export const getUserInfo = (): AppThunk => async dispatch => {
    try {
        const accountName = isAPLink ? await login_scatter() : await login_anchor();
        dispatch(
            setUserInfo({
                kyc: false,
                name: accountName,
                publicKey: '',
                status: 1,
            })
        );
    } catch (e) {
        console.error('login Error:', e);
    }
};

export async function login_scatter() {
    try {
        const scatter: any = getScatter();
        const identity = await scatter.getIdentity({
            accounts: [{ chainId: network.chainId, blockchain: network.blockchain }],
        });
        const account = identity?.accounts[0];
        return account.name
    } catch (e) {
        console.error('login Error:', e);
    }
}

export async function login_anchor() {
    const link = initLink();
    const identity = await link.login(scope);
    const { proof } = await verifyProof(
        link,
        identity,
    );
    await onAppRemoveSession();
    const walletAddress = proof.signer.actor.toString();
    const authority = proof.signer.permission.toString();
    const chainId = network.chainId;

    StorageHelper.setItem('walletAddress', walletAddress);
    StorageHelper.setItem('authority', authority);
    StorageHelper.setItem('chainId', chainId);
    return proof.signer.actor.toString()
}
export default BaseInfoSlice.reducer;

