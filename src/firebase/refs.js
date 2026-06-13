import { ref, child } from "firebase/database";
import { db } from "./config";
import * as N from "./nodes";


export const root = () => rootRestoran();

// ROOT
export const rootRestoran = () =>
  ref(db, N.ROOT_RESTORAN);

// MENU
export const menuRestoran = () =>
  child(rootRestoran(), N.MENU_RESTORAN);

export const menuByDate = (date) =>
  child(menuRestoran(), date);

export const menuDataByDate = (date) =>
  child(menuByDate(date), N.MENU_PODACI);

// INFO
export const infoConnected = () =>
  ref(db, N.INFO_CONNECTED);

// USERS
export const usersRestoran = () =>
  child(rootRestoran(), N.USERS_RESTORAN);

// ORDERS
export const ordersRestoran = () =>
  child(rootRestoran(), N.ORDERS_RESTORAN);

export const orderRef = (orderId) =>
  child(ordersRestoran(), orderId);

// COMPLETE
export const completeOrdersRestoran = () =>
  child(rootRestoran(), N.COMPLETE_ORDERS_RESTORAN);

export const completeOrderRef = (userId, orderId) =>
  child(child(completeOrdersRestoran(), userId), orderId);

// TOTAL PRICE
export const totalPriceRestoran = () =>
  child(rootRestoran(), N.TOTAL_PRICE_RESTORAN);

export const totalRestoranRef = () =>
  child(totalPriceRestoran(), N.TOTAL_RESTORAN);

export const totalPrvaRef = () =>
  child(totalPriceRestoran(), N.TOTAL_PRVA);

export const totalDrugaRef = () =>
  child(totalPriceRestoran(), N.TOTAL_DRUGA);

// GLOBAL LOCK
export const globalLockRef = () =>
  child(totalPriceRestoran(), N.GLOBAL_LOCK);
export const globalLockPath = () =>
  `${N.ROOT_RESTORAN}/${N.GLOBAL_LOCK}`;

// TRANSACTION LOCKS
export const transactionLocksRestoran = () =>
  child(rootRestoran(), N.TRANSACTION_LOCKS_RESTORAN);

export const transactionLockRef = (orderId) =>
  child(transactionLocksRestoran(), orderId);

// RESET
export const totalResetRef = () =>
  child(totalPriceRestoran(), N.RESET);

// MJESECI / PRESJEK
export const mjeseciRestoran = () =>
  child(rootRestoran(), N.MJESECI_RESTORAN);

export const presjekRestoran = () =>
  child(rootRestoran(), N.PRESJEK_RESTORAN);

// APP UPDATE
export const appUpdateRestoran = () =>
  child(rootRestoran(), N.APP_UPDATE_RESTORAN);
  
