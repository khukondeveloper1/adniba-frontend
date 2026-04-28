/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "play-lh.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Allow backend storage URLs - update hostname for production.
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
