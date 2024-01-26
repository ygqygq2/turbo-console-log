import { LineCodeClassProcessing, LineCodeFunctionProcessing } from './types';

export interface LineCodeProcessing extends LineCodeClassProcessing, LineCodeFunctionProcessing {
  isAssignedToVariable(loc: string): boolean;
  isAffectationToVariable(loc: string): boolean;
  isObjectLiteralAssignedToVariable(loc: string): boolean;
  isArrayAssignedToVariable(loc: string): boolean;
}
