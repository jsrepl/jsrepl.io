export enum MarshalledType {
  DomNode = 'dom-node', // non-cloneable
  Function = 'function', // non-cloneable
  Symbol = 'symbol', // non-cloneable
  WeakSet = 'weak-set', // non-cloneable
  WeakMap = 'weak-map', // non-cloneable
  WeakRef = 'weak-ref', // non-cloneable
  Object = 'object', // prototype chain is not preserved in structured clone
  Promise = 'promise', // non-cloneable. Handled differently from MarshalledObject.
  Proxy = 'proxy', // proxy objects are non-cloneable
}

export type MarshalledDomNode = {
  __meta__: {
    type: MarshalledType.DomNode
    tagName: string
    constructorName: string | undefined
    attributes: { name: string; value: string }[]
    hasChildNodes: boolean
    childElementCount: number
    textContent: string | null
  }
  serialized: string
}

export type MarshalledFunction = {
  __meta__: {
    type: MarshalledType.Function
    name: string
  }
  serialized: string
}

export type MarshalledSymbol = {
  __meta__: {
    type: MarshalledType.Symbol
  }
  serialized: string
}

export type MarshalledWeakSet = {
  __meta__: {
    type: MarshalledType.WeakSet
  }
}

export type MarshalledWeakMap = {
  __meta__: {
    type: MarshalledType.WeakMap
  }
}

export type MarshalledWeakRef = {
  __meta__: {
    type: MarshalledType.WeakRef
  }
}

export type MarshalledObject = Record<string, unknown> & {
  __meta__: {
    type: MarshalledType.Object
    constructorName: string | undefined
  }
}

export type MarshalledPromise = {
  __meta__: {
    type: MarshalledType.Promise
  }
}

export type MarshalledProxy = {
  __meta__: {
    type: MarshalledType.Proxy
    target: MarshalledObject
    handler: MarshalledObject
  }
}
