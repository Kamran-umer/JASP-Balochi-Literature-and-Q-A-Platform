// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'ovwpaequpieibqqofygu.supabase.co', // Your Supabase Project URL
//         port: '',
//         pathname: '/storage/v1/object/public/**',
//       },
//     ],
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Your Database
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Google Logins
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com', // GitHub Logins
      },
    ],
  },
};

export default nextConfig;