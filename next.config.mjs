const nextConfig = {
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (dev) {
      config.cache = false;
    }
    // Important: return the modified config
    return config
  },
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
  }
};

export default nextConfig;
