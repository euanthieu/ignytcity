/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: ["localhost:3000", "192.168.100.9:3000"],
};

export default nextConfig;
