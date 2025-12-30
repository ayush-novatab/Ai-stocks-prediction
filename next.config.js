const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude Deno shims and yahoo-finance2 from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'webworker-threads': false,
      };
      
      // Ignore yahoo-finance2 Deno shims on client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        '@deno/shim-deno': false,
        'webworker-threads': false,
      };
    }
    
    // Ignore Natural.js webworker-threads module for both server and client
    config.resolve.alias = {
      ...config.resolve.alias,
      'webworker-threads': false,
    };
    
    // Use IgnorePlugin to ignore webworker-threads module
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^webworker-threads$/,
      })
    );
    
    return config;
  },
}

module.exports = nextConfig
