import {
  ReplPayloadMarshalledType,
  ReplPayloadResultDomNode,
  ReplPayloadResultFunction,
  ReplPayloadResultObject,
  ReplPayloadResultSymbol,
  ReplPayloadResultWeakMap,
  ReplPayloadResultWeakRef,
  ReplPayloadResultWeakSet,
} from '@/types'

export function isMarshalledDomNode(result: object): result is ReplPayloadResultDomNode {
  return getMarshalledType(result) === ReplPayloadMarshalledType.DomNode
}

export function isMarshalledFunction(result: object): result is ReplPayloadResultFunction {
  return getMarshalledType(result) === ReplPayloadMarshalledType.Function
}

export function isMarshalledSymbol(result: object): result is ReplPayloadResultSymbol {
  return getMarshalledType(result) === ReplPayloadMarshalledType.Symbol
}

export function isMarshalledWeakSet(result: object): result is ReplPayloadResultWeakSet {
  return getMarshalledType(result) === ReplPayloadMarshalledType.WeakSet
}

export function isMarshalledWeakMap(result: object): result is ReplPayloadResultWeakMap {
  return getMarshalledType(result) === ReplPayloadMarshalledType.WeakMap
}

export function isMarshalledWeakRef(result: object): result is ReplPayloadResultWeakRef {
  return getMarshalledType(result) === ReplPayloadMarshalledType.WeakRef
}

export function isMarshalledObject(result: object): result is ReplPayloadResultObject {
  return getMarshalledType(result) === ReplPayloadMarshalledType.Object
}

export function getMarshalledType(result: object): ReplPayloadMarshalledType | null {
  return '__meta__' in result &&
    result.__meta__ !== null &&
    typeof result.__meta__ === 'object' &&
    'type' in result.__meta__ &&
    typeof result.__meta__.type === 'string'
    ? (result.__meta__.type as ReplPayloadMarshalledType)
    : null
}
