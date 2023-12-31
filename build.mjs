import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { replace } from 'esbuild-plugin-replace';

const options = {
  entryPoints: ['src/index.tsx', 'src/index.html'],
  bundle: true,
  outdir: 'dist',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  target: 'es2018',
  logLevel: 'info',
  loader: {
    '.html': 'copy',
    '.woff': 'file',
    '.woff2': 'file',
    '.3mf': 'copy',
  },
  plugins: [
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: 'cwd',
      assets: {
        from: [
          './public/**/*.3mf',
          './public/*.png',
          './public/*.ico',
          './public/*.webmanifest',
        ],
        to: ['./dist'],
      },
      watch: true,
    }),
    replace({
      __MATOMO_TRACKING_HOST: process.env.MATOMO_TRACKING_HOST || 'localhost',
    }),
  ],
};

if (process.argv?.length > 2) {
  const ctx = await esbuild.context(options);

  if (process.argv.includes('--watch')) {
    await ctx.watch();
  }
  if (process.argv.includes('--serve')) {
    await ctx.serve({
      servedir: 'dist',
    });
  }
} else {
  await esbuild.build(options);
}
