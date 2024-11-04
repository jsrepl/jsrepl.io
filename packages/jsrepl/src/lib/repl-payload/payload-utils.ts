import {
  MarshalledDomNode,
  MarshalledFunction,
  MarshalledObject,
  MarshalledSymbol,
  MarshalledType,
  MarshalledWeakMap,
  MarshalledWeakRef,
  MarshalledWeakSet,
} from '@jsrepl/shared-types'

export function isMarshalledDomNode(result: object): result is MarshalledDomNode {
  return getMarshalledType(result) === MarshalledType.DomNode
}

export function isMarshalledFunction(result: object): result is MarshalledFunction {
  return getMarshalledType(result) === MarshalledType.Function
}

export function isMarshalledSymbol(result: object): result is MarshalledSymbol {
  return getMarshalledType(result) === MarshalledType.Symbol
}

export function isMarshalledWeakSet(result: object): result is MarshalledWeakSet {
  return getMarshalledType(result) === MarshalledType.WeakSet
}

export function isMarshalledWeakMap(result: object): result is MarshalledWeakMap {
  return getMarshalledType(result) === MarshalledType.WeakMap
}

export function isMarshalledWeakRef(result: object): result is MarshalledWeakRef {
  return getMarshalledType(result) === MarshalledType.WeakRef
}

export function isMarshalledObject(result: object): result is MarshalledObject {
  return getMarshalledType(result) === MarshalledType.Object
}

export function getMarshalledType(result: object): MarshalledType | null {
  return '__meta__' in result &&
    result.__meta__ !== null &&
    typeof result.__meta__ === 'object' &&
    'type' in result.__meta__ &&
    typeof result.__meta__.type === 'string'
    ? (result.__meta__.type as MarshalledType)
    : null
}
