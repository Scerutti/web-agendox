/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@agendox/ui',
    '@agendox/domain',
    '@agendox/api-client',
    '@agendox/api-types',
    '@agendox/notifications',
  ],
};

export default nextConfig;
