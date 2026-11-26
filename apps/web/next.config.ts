import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Share the repo-root .env with the worker during local development.
const rootEnv = path.resolve(process.cwd(), "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  transpilePackages: ["@pulse/core"],
  poweredByHeader: false,
};

export default nextConfig;
