const isProduction = process.env.NODE_ENV === 'production';
const disableOptimize = process.env.DISABLE_LIGHTNING_CSS === 'true' || !isProduction;

export default {
  plugins: {
    '@tailwindcss/postcss': {
      optimize: !disableOptimize,
    },
  },
};
