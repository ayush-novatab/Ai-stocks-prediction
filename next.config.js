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
      };
      
      // Ignore yahoo-finance2 Deno shims on client-side
      config.resolve.alias = {
        ...config.resolve.alias,
        '@deno/shim-deno': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
