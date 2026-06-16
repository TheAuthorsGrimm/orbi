/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
};

export default config;
