import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"실적 발표 캘린더 | 미국·일본",description:"미국과 일본 기업의 주간 실적 발표 일정을 확인하는 간결한 캘린더입니다.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}