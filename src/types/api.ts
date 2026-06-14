// src/types/api.ts
//
// BE GlobalExceptionHandler의 ErrorResponse와 1:1 대응하는 FE 타입.
// 모든 API 에러 응답은 이 형태로 내려온다.

export type ApiErrorResponse = {
  timestamp: string // ISO 8601
  status: number
  code: string // ex) "COMMON_500", "AUTH_401"
  message: string
  path: string
}

// axios 인터셉터에서 에러를 이 타입으로 래핑해 던지도록 한다.
export type ApiError = {
  status: number
  code: string
  message: string
}
