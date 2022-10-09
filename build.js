const glob = require('glob');
const esbuild = require('esbuild');

esbuild
    .build({
        stdin: { contents: '' },
        inject: glob.sync('src/**/*.ts'),
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: './lib-compact/index.js',
    })
    .then(() => console.log("index.js generation complete."))
    .catch((e) => console.error(e));