/** @type {import('next').NextConfig} */
export default {
  serverExternalPackages: ["sharp"],
  // Make sure the Bengali font file ships with the serverless functions.
  outputFileTracingIncludes: { "/api/**/*": ["./assets/fonts/**"] },
};
