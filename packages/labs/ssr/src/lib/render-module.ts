/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {getWindow} from '../lib/dom-shim.js';
import {ModuleLoader} from './module-loader.js';
import {createRequire} from 'module';

/**
 * Imports a module into a web-like rendering VM content and calls the function
 * exported as `functionName`.
 *
 * @param specifier
 * @param referrer
 * @param functionName
 * @param args
 */
export const renderModule = async (
  specifier: string,
  referrer: string,
  functionName: string,
  args: unknown[]
) => {
  const window = getWindow({
    includeJSBuiltIns: true,
    props: {
      // We need to give window a require to load CJS modules used by the SSR
      // implementation. If we had only JS module dependencies, we wouldn't need this.
      require: createRequire(import.meta.url),
    },
  });
  const loader = new ModuleLoader({global: window});
  const importResult = await loader.importModule(specifier, referrer);
  const {module} = importResult;
  const f = module.namespace[functionName] as Function;
  // TODO: should we require the result be an AsyncIterable?
  return f(...args);
};
