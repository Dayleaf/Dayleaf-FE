// src/lib/api/client.ts
//
// BE 연동을 위한 axios 인스턴스.
//
// 설계 원칙:
//   - 인증: BE는 JWT Bearer 토큰 방식이다. 토큰은 로컬스토리지에서 가져온다.
//     (추후 인증 스토어(zustand) 연동 시 이 파일만 수정한다.)
//   - 에러: BE GlobalExceptionHandler의 ErrorResponse 형태(code, message)를
//     ApiError로 래핑해 던진다. 호출부에서 code로 분기 처리할 수 있다.
//   - baseURL: 환경변수 NEXT_PUBLIC_API_URL로 주입받는다.
//     개발 환경에서는 .env.local에 설정하고, 운영에서는 BE 실제 주소로 바꾼다.

import axios, { AxiosError } from 'axios'
import type { ApiError, ApiErrorResponse } from '@/types/api'

// BE baseURL. 설정되지 않은 경우 로컬 기본값으로 fallback.
// Next.js는 next-env.d.ts를 통해 process.env.NEXT_PUBLIC_* 타입을 자동 제공한다.
// 이 파일은 Next.js 프로젝트에서만 사용되므로 process.env 접근이 유효하다.
const BASE_URL =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process as any).env?.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// 요청 인터셉터 — Authorization 헤더 주입
// 현재 BE는 SecurityConfig에서 JWT 필터로 인증하므로, Access Token을 Bearer로 첨부한다.
apiClient.interceptors.request.use((config) => {
  // 브라우저 환경(클라이언트 컴포넌트)에서만 토큰을 읽는다.
  // 서버 컴포넌트에서는 쿠키 기반 인증으로 전환 시 이 분기를 수정한다.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 응답 인터셉터 — BE ErrorResponse → ApiError 변환
// BE의 GlobalExceptionHandler는 항상 { timestamp, status, code, message, path }를 반환한다.
// 호출부에서 code로 분기 처리할 수 있도록 ApiError 형태로 래핑한다.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const data = error.response?.data
    const apiError: ApiError = {
      status: error.response?.status ?? 0,
      code: data?.code ?? 'UNKNOWN',
      message: data?.message ?? '알 수 없는 오류가 발생했습니다.',
    }
    return Promise.reject(apiError)
  }
)
