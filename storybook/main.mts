import { createRequire } from 'node:module';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/*
 * Storybook 10 loads this file as ESM, so there is no ambient `require`. The
 * two things that needed one still need one: a plugin package with no ESM
 * entry, and a resolution that has to start from another package's location.
 * `createRequire` is the sanctioned way to ask for both from an ES module, and
 * it is not the faux-ESM `require` the migration warns about, which is an
 * ambient call that only works because a loader transpiled the file to
 * CommonJS behind your back.
 *
 * Synchronous rather than a dynamic import, because a top-level await is not
 * available here: Storybook's config loader transpiles this file to CommonJS
 * with esbuild, which shims `import.meta.url` and rejects top-level `await`
 * outright. webpack is CommonJS, so requiring it is the right call regardless.
 */
const cjs = createRequire(import.meta.url);
const { resolve } = cjs;

/*
 * Take webpack from the builder rather than from the top of node_modules. Yarn
 * resolves @storybook/builder-webpack5's own webpack range separately from this
 * package's pinned one and nests the result, so the two are different copies of
 * webpack with different class objects in them. A plugin built from one and
 * registered on a compiler from the other constructs dependencies the compiler
 * does not recognise: ProvidePlugin writes `loc` on a Dependency that is not the
 * Dependency class the parser produced, the write throws inside the parse, and
 * every module the plugin touches reports "Module parse failed" with no file
 * named.
 *
 * Still three copies as of this commit, so the indirection stays:
 * node_modules/webpack, and one each under @storybook/builder-webpack5 and
 * @storybook/preset-react-webpack.
 */
const webpack = cjs(
  resolve('webpack', { paths: [resolve('@storybook/builder-webpack5')] })
);

export default {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  stories: [
    '../storybook/stories/**/*.stories.@(ts|tsx)',
    '../source/renderer/app/**/*.@(stories|story).@(ts|tsx)',
  ],
  addons: [
    // Controls is an addon at 8.x and moves into core at 9, so this entry is
    // temporary by construction and goes at the version bump.
    '@storybook/addon-controls',
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  // Make whatever fine-grained changes you need
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    // Make whatever fine-grained changes you need

    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.NormalModuleReplacementPlugin(
        /@trezor[\\/]transport[\\/]lib[\\/]transports[\\/]nodeusb\.js$/,
        resolve('@trezor/transport/lib/transports/nodeusb.browser.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@trezor[\\/]transport[\\/]lib[\\/]transports[\\/]udp\.js$/,
        resolve('@trezor/transport/lib/transports/udp.browser.js')
      ),
    ];
    config.experiments = {
      syncWebAssembly: true,
    };
    // Merge into config.resolve rather than assigning over it. Storybook puts
    // things there that the preview cannot run without: @storybook/react-dom-shim
    // aliases itself to its react-16 build whenever react-dom is below 18, and
    // discarding that alias makes the preview resolve react-dom/client, which
    // React 16 does not have.
    config.resolve = {
      ...config.resolve,
      extensions: [
        ...new Set([
          ...(config.resolve.extensions || []),
          '.ts',
          '.tsx',
          '.js',
          '.json',
        ]),
      ],
      fallback: {
        ...config.resolve.fallback,
        process: resolve('process/browser'),
        path: resolve('path-browserify'),
        crypto: resolve('crypto-browserify'),
        stream: resolve('stream-browserify'),
        http: resolve('stream-http'),
        https: resolve('https-browserify'),
        url: resolve('url'),
        buffer: resolve('buffer/'), // https://www.npmjs.com/package/buffer#usage
        os: resolve('os-browserify/browser'),
        // child_process is only used in the Electron main process (ARM detection).
        // Provide an empty stub so Storybook's webpack can bundle environment.ts.
        // The execFileSync call is unreachable in a browser context (isMacOS === false).
        child_process: false,
        // dgram is a Node.js UDP socket API used by @trezor/transport for Node USB
        // transport. Stub it out — Storybook runs in a browser and never opens USB.
        dgram: false,
        // fs is used by node-gyp-build (inside usb) to load native .node files.
        // Stub it out — native modules can't load in a browser context.
        fs: false,
        usb: false,
        'node-gyp-build': false,
      },
    };
    config.module.rules.push(
      {
        test: /\.tsx?$/,
        loader: 'swc-loader',
        options: {
          parseMap: true,
          sourceMaps: true,
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              decorators: true,
            },
            transform: {
              // MobX 5 uses legacy (Stage 1) decorators; without this SWC 1.7+
              // uses the new TC39 Stage 3 proposal which breaks @observable etc.
              legacyDecorator: true,
              // Class fields must use assignment (not Object.defineProperty) so
              // MobX prototype setters can intercept them during initialization.
              useDefineForClassFields: false,
              react: {
                runtime: 'automatic',
              },
            },
            target: 'es2019',
            loose: false,
          },
        },
      },
      {
        test: /\.scss/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]_[local]',
              },
              sourceMap: true,
              importLoaders: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              implementation: resolve('sass'),
            },
          },
        ],
      },
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.inline\.svg$/,
        use: 'svg-inline-loader',
        type: 'javascript/auto',
      },
      {
        test: /\.(woff2?|eot|ttf|otf|png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: /\.inline\.svg$/,
        type: 'asset/resource',
      }
    );

    // Return the altered config
    return config;
  },
};
