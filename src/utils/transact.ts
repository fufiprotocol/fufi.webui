import {getClient, isAPLink, scope} from './client';
import {StorageHelper} from '@/utils/storage';
import {login_anchor} from "@/state/base/reducer";
export type action = {
  contract: string; // 合约名称
  name: string; // 合约方法名
  data: any; // 合约参数
};
/**
 * 调用合约
 */
export async function transact(actions: action[]) {
  // 过滤出正确的action
  actions = actions.filter(item => checkAction(item));

  if (!Array.isArray(actions) || !actions.length) {
    return;
  }

  if (!isAPLink) {
    return await anchor(actions);
  } else {
    return await scatter(actions);
  }
}

function checkAction(action: action) {
  const { contract, data, name } = action;
  if (!contract || !data || !name) {
    return false;
  }
  return true;
}

/**
 * Scatter发起交易
 * @param actions
 * @returns
 */
async function scatter(actions: action[]) {
  const client = await getClient();
  if (actions.length === 1) {
    const { contract, data, name } = actions[0];
    const contractObj = await client.contract(contract);
    return await contractObj[name](data);
  } else {
    return await client.transaction(
      actions.map(action => action.contract),
      obj => {
        for (const action of actions) {
          obj[action.contract.replace('.', '_')][action.name](action.data);
        }
      },
    );
  }
}

/**
 * Anchor发起交易
 * @param actions
 * @returns
 */

async function anchor(actions: action[]) {
  const walletAddress = StorageHelper.getItem('walletAddress');
  const authority = StorageHelper.getItem('authority');

  if(!(window as any).__LINK__){
    await login_anchor()
  }
  // @ts-ignore
  const session = await (window as any).__LINK__.restoreSession(scope);
  console.log('sessionsessionsession',session)
  if(!session){
   await login_anchor()
  }

  const toAction = (action: action) => ({
    account: action.contract,
    name: action.name,
    authorization: [
      {
        actor: walletAddress,
        permission: authority,
      },
    ],
    data: action.data,
  });

  if (actions.length === 1) {
    return await session.transact(
      { action: toAction(actions[0]) },
      { broadcast: true },
    );
  } else {
    console.log(actions.map(item => toAction(item)));
    return await session.transact(
      { actions: actions.map(item => toAction(item)) },
      { broadcast: true },
    );
  }
}
