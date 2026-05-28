// src/common/errors/error-code.map.ts

// 1. 定義全域錯誤代碼
export enum ErrorCode {
  // Auth & User 相關 (1xxx)
  USER_EMAIL_DUPLICATE = '1001',
  USER_USERNAME_DUPLICATE = '1002',
  USER_NOT_FOUND = '1003',
  INVALID_CREDENTIALS = '1004',
  // 權限不足
  PERMISSION_DENIED = '1005',

  // 貓咪與送養相關
  CAT_NOT_FOUND = '2001',
  CAT_ALREADY_ADOPTED = '2002',

  // 系統相關 (9xxx)
  DATABASE_ERROR = '9001',
  UNKNOWN_ERROR = '9999',
}

// 2. 建立代碼與訊息的對應表
export const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.USER_EMAIL_DUPLICATE]: '此信箱已註冊過',
  [ErrorCode.USER_USERNAME_DUPLICATE]: '此帳號已被使用',
  [ErrorCode.USER_NOT_FOUND]: '找不到該名使用者',
  [ErrorCode.INVALID_CREDENTIALS]: '帳號或密碼錯誤',
  [ErrorCode.PERMISSION_DENIED]: '使用者權限不足',
  
  
  [ErrorCode.CAT_NOT_FOUND]: '找不到這隻貓咪',
  [ErrorCode.CAT_ALREADY_ADOPTED]: '這隻貓咪已經被收編囉',

  [ErrorCode.DATABASE_ERROR]: '資料庫發生異常',
  [ErrorCode.UNKNOWN_ERROR]: '發生未知錯誤，請稍後再試',
};