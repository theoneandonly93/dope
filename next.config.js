const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'utf-8-validate': false,
      bufferutil: false,
      encoding: false,
      ...(isServer ? {} : { ws: false, 'rpc-websockets': false }),
    };
    if (isServer) {
      // Prevent Next from trying to bundle optional native deps on server
      config.externals = [...(config.externals || []), 'utf-8-validate', 'bufferutil'];
    } else {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
