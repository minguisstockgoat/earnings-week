import type {NextConfig} from "next";
const isPages=process.env.GITHUB_ACTIONS==="true";
const repoName=process.env.GITHUB_REPOSITORY?.split("/")[1]??"";
const basePath=isPages&&repoName&&!repoName.endsWith(".github.io")?`/${repoName}`:"";
const nextConfig:NextConfig={...(isPages?{output:"export" as const,images:{unoptimized:true},basePath,assetPrefix:basePath,trailingSlash:true}:{})};
export default nextConfig;
