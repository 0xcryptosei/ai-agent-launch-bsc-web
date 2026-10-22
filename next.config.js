/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/create", destination: "/desk/create", permanent: false },
      { source: "/agents/:id", destination: "/desk/agents/:id", permanent: false },
    ];
  },
};
module.exports = nextConfig;
