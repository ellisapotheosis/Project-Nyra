module.exports = {
  plugins: {
    // Tailwind is pinned to v3 because the current Cloudflare Pages build path
    // fails with the v4 @tailwindcss/postcss plugin in this app.
    tailwindcss: {},
    autoprefixer: {},
  },
};
