import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker runtime stays small
  // and the image runs without a node_modules install.
  output: "standalone",
};

export default nextConfig;
