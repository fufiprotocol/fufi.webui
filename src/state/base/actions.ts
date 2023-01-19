import { createAction } from '@reduxjs/toolkit';

export type AccountStatus = 0 | 1; // 0: 未激活   1：已激活
export type Language = string;
export interface AcountState {
    kyc: boolean;
    name: string;
    publicKey: string;
    status: AccountStatus;
}

export const setUserInfo = createAction<AcountState>('base/setUserInfo');
export const setLanguage = createAction<Language>('base/setLanguage');
