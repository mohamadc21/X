const nextConfig = {
  env: {
    TZ: "Asia/tehran"
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        // pathname: '/v1/storage/buckets/66d0a02800176fb696ad/files/66d0dac30039b546026d/view'
      }
    ]
  }
};

export default nextConfig;
