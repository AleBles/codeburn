import { chmod, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const COMPILE = process.argv.includes('--compile')
const TARGET = (() => {
  const i = process.argv.indexOf('--target')
  return i >= 0 ? process.argv[i + 1] : undefined
})()

// Ink's reconciler.js does `await import('./devtools.js')` which then statically
// imports `react-devtools-core`. The dynamic import is gated behind
// `process.env.DEV === 'true'`, but Bun's bundler still pulls devtools.js into
// the graph. Stub `react-devtools-core` to a no-op module so the bundle resolves
// without shipping the real (heavy) package.
const stubReactDevtoolsCore = {
  name: 'stub-react-devtools-core',
  setup(build: { onResolve: (filter: { filter: RegExp }, cb: (args: { path: string }) => unknown) => void; onLoad: (filter: { filter: RegExp; namespace?: string }, cb: () => { contents: string; loader: string }) => void }) {
    build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: 'react-devtools-core',
      namespace: 'stub-rdc',
    }))
    build.onLoad({ filter: /.*/, namespace: 'stub-rdc' }, () => ({
      contents: 'export default { initialize() {}, connectToDevTools() {} }',
      loader: 'js',
    }))
  },
}

await mkdir('dist', { recursive: true })

if (COMPILE) {
  const outfile = process.argv.includes('--outfile')
    ? process.argv[process.argv.indexOf('--outfile') + 1]!
    : 'dist/burnrate'
  const result = await Bun.build({
    entrypoints: ['src/cli.ts'],
    outdir: undefined,
    target: 'bun',
    compile: TARGET ? { target: TARGET, outfile } : { outfile },
    plugins: [stubReactDevtoolsCore as never],
  } as never)
  if (!result.success) {
    for (const log of result.logs) console.error(log)
    process.exit(1)
  }
} else {
  const result = await Bun.build({
    entrypoints: ['src/cli.ts'],
    outdir: 'dist',
    target: 'bun',
    format: 'esm',
    banner: '#!/usr/bin/env bun',
    plugins: [stubReactDevtoolsCore as never],
  })
  if (!result.success) {
    for (const log of result.logs) console.error(log)
    process.exit(1)
  }
  await chmod(join('dist', 'cli.js'), 0o755)
}
