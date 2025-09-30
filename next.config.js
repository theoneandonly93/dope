const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'utf-8-validate': false,
      bufferutil: false,
      encoding: false,
      // Avoid bundling Node ws on the client; let rpc-websockets use browser WebSocket
      ...(isServer ? {} : { ws: false, 'rpc-websockets': require.resolve('./shims/rpc-websockets.js') }),
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
      // Provide Buffer globally for any lib that expects it
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }));
    }
    return config;
  },
};

module.exports = nextConfig;
