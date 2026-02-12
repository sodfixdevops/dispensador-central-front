/** @type {import('next').NextConfig} */

const nextConfig = {
	async headers() {
		return [
			{
				// Cache long the compiled, hashed assets
				source: "/_next/static/:path*",
				headers: [
					{ key: "Cache-Control", value: "public, max-age=31536000, immutable" },
				],
			},
			{
				// Do not cache HTML/pages: force revalidation so new HTML fetches updated asset hashes
				source: "/:path*",
				headers: [
					{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
				],
			},
		];
	},
};

export default nextConfig;
