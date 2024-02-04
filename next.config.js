/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    swcPlugins: [["@swc-jotai/react-refresh", {}]],
  },
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 's3.us-west-2.amazonaws.com',
            port: '',
            pathname: '/images.unsplash.com/small/**',
        },
    ],
},
};

export default config;
