import * as shop from './shop';
import { global } from './util';
import * as wallet from './wallet';

global.tsdkConnect = wallet.connect;
global.tsdkDisconnect = wallet.disconnect;
global.tsdkPurchaseGameToken = shop.purchaseGameToken;
