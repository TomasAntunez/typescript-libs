import type { Linter } from 'eslint';

import { base as basePart } from './base.js';
import { esm as esmPart } from './esm.js';
import { node as nodePart } from './node.js';
import { react as reactPart } from './react.js';
import { typescript as typescriptPart } from './typescript.js';
import { typescriptTypechecked as typescriptTypecheckedPart } from './typescript-typechecked.js';

export const base: Linter.Config[] = basePart;

export const node: Linter.Config[] = [...basePart, ...nodePart];
export const esm: Linter.Config[] = [...basePart, ...esmPart];
export const nodeEsm: Linter.Config[] = [...basePart, ...nodePart, ...esmPart];

export const typescript: Linter.Config[] = [...basePart, ...typescriptPart];
export const typescriptEsm: Linter.Config[] = [...basePart, ...esmPart, ...typescriptPart];
export const typescriptNode: Linter.Config[] = [...basePart, ...nodePart, ...typescriptPart];
export const typescriptNodeEsm: Linter.Config[] = [
  ...basePart,
  ...nodePart,
  ...esmPart,
  ...typescriptPart,
];

export const typescriptTypechecked: Linter.Config[] = [...basePart, ...typescriptTypecheckedPart];
export const typescriptTypecheckedEsm: Linter.Config[] = [
  ...basePart,
  ...esmPart,
  ...typescriptTypecheckedPart,
];
export const typescriptTypecheckedNode: Linter.Config[] = [
  ...basePart,
  ...nodePart,
  ...typescriptTypecheckedPart,
];
export const typescriptTypecheckedNodeEsm: Linter.Config[] = [
  ...basePart,
  ...nodePart,
  ...esmPart,
  ...typescriptTypecheckedPart,
];

export const typescriptTypecheckedReactEsm: Linter.Config[] = [
  ...typescriptTypecheckedEsm,
  ...reactPart,
];
