import Amax from '@amax/amaxjs';
import { IdentityProof } from 'eosio-signing-request';
import AnchorLink, {
  APIError,
  ChainId,
  LinkChannelSession,
  LinkSession,
} from '@amax/anchor-link';
import AnchorLinkBrowserTransport from '@amax/anchor-link-browser-transport';
import {StorageHelper} from "@/utils/storage";
const { REACT_APP_NETWORK_chainId, REACT_APP_NETWORK_host, REACT_APP_NETWORK_port, REACT_APP_NETWORK_protocol } = process.env;

let _getClient = null;

console.log('chainId---', REACT_APP_NETWORK_chainId)

export const network = {
  blockchain: 'amax',
  expireInSeconds: 600,
  // host: '913.224.250.244', // ( or null if endorsed chainId )
  host: REACT_APP_NETWORK_host, // ( or null if endorsed chainId )
  port: REACT_APP_NETWORK_port, // ( or null if defaulting to 80 )
  chainId: REACT_APP_NETWORK_chainId, // Or null to fetch automatically ( takes longer )
  protocol: REACT_APP_NETWORK_protocol,
};

const options = {
  broadcast: true,
  sign: true,
  expireInSeconds: 200,
  chainId: network.chainId,
};
export const blockchains = [
  {
    chainId: network.chainId,
    name: network.blockchain,
    rpcEndpoints: [
      {
        protocol: network.protocol,
        host: network.host,
        port: 0,
      },
    ],
  },
];
export const scope = 'dex';
export const isAPLink = window.navigator.userAgent
    .toLowerCase()
    .includes('aplink');

export async function getClient() {
  if (_getClient) return _getClient;

  const scatter = getScatter();
  if (scatter) {
    if (!(window as any).scatterAMAX) {
      const identity = await scatter.getIdentity({
        accounts: [{ chainId: network.chainId, blockchain: network.blockchain }],
      });

      const account = identity?.accounts[0];
      (window as any).scatterAMAX = scatter.amax(
          network,
          Amax,
          {
            ...options,
            authorization: [`${account.name}@${account.authority}`],
          },
          network.protocol
      );
    }
    _getClient = (window as any).scatterAMAX;
    return _getClient;
  }

  /**
   * 有些数据不需要连接钱包，也可以展示
   */
  if (!(window as any).AMAX) {
    (window as any).AMAX = Amax({
      httpEndpoint: `${network.protocol}://${network.host}`,
      chainId: network.chainId,
    });
  }
  _getClient = (window as any).AMAX;
  return _getClient;
}

export function getScatter() {
  return (window as any).scatter;
}

export async function getContract(abi_name: string) {
  const client = await getClient();
  return await client.contract(abi_name);
}
export function initLink() {
  if (!(window as any).__LINK__) {
    const transport = new AnchorLinkBrowserTransport();
    const link = new AnchorLink({
      transport,
      service: 'https://fwd.aplink.app', // 'ws://192.168.80.152:7001', // 'http://fwd.aplink.app', //
      chains: [
        {
          chainId: network.chainId,
          nodeUrl: `${network.protocol}://${network.host}`,
        },
      ],
    });

    link.restoreSession(scope).then(session => {
      console.log('session', session);
    });

    (window as any).__LINK__ = link;
    onAppRemoveSession();
  }
  return (window as any).__LINK__;
}
export async function onAppRemoveSession() {
  console.log('sessionRemove');
  if (!(window as any).__LINK__) {
    return;
  }

  const session: LinkSession = await (window as any).__LINK__.restoreSession(scope);
  console.log('sessionRemovesss', session);
  if (session) {
    (session as LinkChannelSession).onAppRemoveSession(() => {
      StorageHelper.removeItem('walletAddress');
      StorageHelper.removeItem('authority');
      StorageHelper.removeItem('chainId');
      (window as any).__LINK__.clearSessions(scope);
      window.location.reload();
    });
  }
}
export async function verifyProof(link, identity) {
  // Generate an array of valid chain IDs from the demo configuration
  const chains = blockchains.map(chain => chain.chainId);

  // Create a proof helper based on the identity results from anchor-link
  const proof = IdentityProof.from(identity.proof);

  // Check to see if the chainId from the proof is valid for this demo
  const chain = chains.find(id => ChainId.from(id).equals(proof.chainId));
  if (!chain) {
    throw new Error('Unsupported chain supplied in identity proof');
  }

  // Load the account data from a blockchain API
  // let account: API.v1.AccountObject;
  let account = null;
  try {
    account = await link.client.v1.chain.get_account(proof.signer.actor);
  } catch (error) {
    if (error instanceof APIError && error.code === 0) {
      throw new Error('No such account');
    } else {
      throw error;
    }
  }

  // Retrieve the auth from the permission specified in the proof
  const auth = account.getPermission(proof.signer.permission).required_auth;

  // Determine if the auth is valid with the given proof
  const valid = proof.verify(auth, account.head_block_time);

  // If not valid, throw error
  if (!valid) {
    throw new Error('Proof invalid or expired');
  }

  // Recover the key from this proof
  const proofKey = proof.recover();

  // Return the values expected by this demo application
  return {
    account,
    proof,
    proofKey,
    proofValid: valid,
  };
}
// merchant=merchant1
// Private key: 5JZTokHvSvRXbskUqzhU5paafQbqUEj13qyQ9vDpW6NHK67gUbb
// Public key: AM5cizvBZobd1rNhw5N89wuqevzZbLxk2x6QZQVWvFdg3uTFpEJV

// merchant=merchantx
// Private key: 5JfxfDzeSTXiSbTzhxCo1eAmxbHd88THgS11ZZ6hLZqSPMCH636
// Public key: AM8HxjZAiqEY5mHCPXjCb7xEaU2tkmqdAek2TXX1CxTbnYMBqadX

// merchant=merchantx2
// Private key: 5Kk2pP4S1Q6MvMc6vit5vc8bSNmzyddRptcWCRngA2Mff4fynMP
// Public key: AM79jCfBdjEMP5fHmWMv4W1G6zMVGespL9nBvG4ETA5dJKQsRbgq

// conf=oxo.conf
// Private key: 5JGBUZNqqsJLNUANj2c7wyDZ7Ct84s92ojdRTcL8fu6uJxJcPrH
// Public key: AM6ttUE76EZw8E4MJVtHGaMfY8pcsSRf2EBqZhrHpyXZfhvho3ce

// book=oxo.cash
// Private key: 5J6MbPZ51wqu5jNJXb2Lv1X9mxVwn5UsaWEd4vs41kmcttVRHVG
// Public key: AM64xpLyp5CWPRs9YS1ce9rjBMXUS4azX5BtFh6wJAhvpZDT4Q2D
