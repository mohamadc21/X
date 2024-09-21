const nextConfig = {
  env: {
    TZ: "Asia/tehran"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
  output: "standalone"
};

export default nextConfig;
