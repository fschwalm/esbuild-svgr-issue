import esbuild, { BuildOptions } from "esbuild";
import svgrPlugin from "esbuild-plugin-svgr";
import path from "path";
import globby from "globby";

import pkg from "./package.json";

const rootPath = path.resolve();

async function _findEntryPoints() {
  const files = await globby([
    path.resolve(rootPath, "src/**/*.ts"),
    path.resolve(rootPath, "src/**/*.tsx"),
  ]);

  return files;
}

const defaultConfig: Partial<BuildOptions> = {
  format: "esm",
  sourcemap: "external",
  inject: ["./react-shim.js"],
  plugins: [svgrPlugin()],
};

const bundleConfig: Partial<BuildOptions> = {
  bundle: true,
  outfile: "build/index.js",
  entryPoints: ["./src/index.ts"],
  external: [...Object.keys(pkg.peerDependencies || {})],
};

const noBundleConfig = {
  bundle: false,
  outdir: "build",
};

const isToBundle = process.argv.includes("--bundle");

async function main() {
  if (isToBundle) {
    esbuild.build({ ...defaultConfig, ...bundleConfig });
  } else {
    const entryPoints = await _findEntryPoints();

    esbuild.build({
      entryPoints,
      ...defaultConfig,
      ...noBundleConfig,
    });
  }
}

main();
