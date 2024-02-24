export enum BracketType {
  PARENTHESIS = 'PARENTHESIS', // ( )
  CURLY_BRACES = 'CURLY_BRACES', // { }
}

export enum LogMessageType {
  ArrayAssignment = 'ArrayAssignment',
  Decorator = 'Decorator',
  MultiLineAnonymousFunction = 'MultiLineAnonymousFunction',
  MultilineBraces = 'MultilineBraces',
  MultilineParenthesis = 'MultilineParenthesis',
  NamedFunction = 'NamedFunction',
  NamedFunctionAssignment = 'NamedFunctionAssignment',
  ObjectFunctionCallAssignment = 'ObjectFunctionCallAssignment',
  ObjectLiteral = 'ObjectLiteral',
  PrimitiveAssignment = 'PrimitiveAssignment',
  Ternary = 'Ternary',
}
