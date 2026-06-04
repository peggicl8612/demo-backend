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
  UNAUTHORIZED = '1006',
  TOKEN_EXPIRED = '1007',
  VALIDATION_FAILED = '1008',
  TOO_MANY_REQUESTS = '1009',
  RESOURCE_NOT_FOUND = '1010',

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
  [ErrorCode.UNAUTHORIZED]: '授權不符，請先登入',
  [ErrorCode.TOKEN_EXPIRED]: 'TOKEN過期，請重新登入',
  [ErrorCode.VALIDATION_FAILED]: '資料驗證失敗，請重新嘗試',
  [ErrorCode.TOO_MANY_REQUESTS]: '請勿頻繁操作，請稍後再試',
  [ErrorCode.RESOURCE_NOT_FOUND]: '資源不存在',
  
  [ErrorCode.CAT_NOT_FOUND]: '找不到這隻貓咪',
  [ErrorCode.CAT_ALREADY_ADOPTED]: '這隻貓咪已經被收編囉',

  [ErrorCode.DATABASE_ERROR]: '資料庫發生異常',
  [ErrorCode.UNKNOWN_ERROR]: '發生未知錯誤，請稍後再試',
};