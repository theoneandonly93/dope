const webpack = require('webpack');

const nextConfig = {
  // Allow overriding build dir to avoid cross-FS issues (e.g., WSL on Windows drives)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'utf-8-validate': false,
      bufferutil: false,
      encoding: false,
  '@injectivelabs/ts-types': require('path').resolve(__dirname, 'shims/injective-ts-types.js'),
  '@injectivelabs/token-metadata': require('path').resolve(__dirname, 'shims/injective-token-metadata.js'),
  '@injectivelabs/networks': require('path').resolve(__dirname, 'shims/injective-empty.js'),
  '@injectivelabs/sdk-ts': require('path').resolve(__dirname, 'shims/injective-empty.js'),
      // Avoid bundling Node ws on the client; disable ws. We don't alias rpc-websockets; WS is disabled in code.
      ...(isServer ? {} : { ws: false }),
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
