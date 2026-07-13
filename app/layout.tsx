import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"Earnings Week | 주간 기업 실적 캘린더",description:"2026년 7월 13일부터 19일까지 주요 미국 기업의 실적 발표 일정과 예상 EPS를 확인하세요.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
