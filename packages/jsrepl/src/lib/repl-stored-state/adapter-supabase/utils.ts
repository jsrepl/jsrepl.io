import { deepEqual } from '@/lib/equal'
import {
  ReplCreatePayload,
  ReplRecordPayloadWithUser,
  ReplStoredState,
  ReplUpdatePayload,
} from '@/types'

export function fromPayload(payload: ReplRecordPayloadWithUser): ReplStoredState {
  return {
    id: payload.id,
    user_id: payload.user_id,
    user: payload.user
      ? {
          avatar_url: payload.user.avatar_url,
          user_name: payload.user.user_name,
        }
      : null,
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    title: payload.title,
    description: payload.description,
    fs: payload.fs,
    openedModels: payload.opened_models,
    activeModel: payload.active_model,
    showPreview: payload.show_preview,
  }
}

export function toUpdatePayload(state: ReplStoredState): ReplUpdatePayload {
  return {
    id: state.id,
    title: state.title,
    description: state.description,
    fs: state.fs,
    opened_models: state.openedModels,
    active_model: state.activeModel,
    show_preview: state.showPreview,
  }
}

export function toCreatePayload(state: ReplStoredState): ReplCreatePayload {
  return {
    title: state.title,
    description: state.description,
    fs: state.fs,
    opened_models: state.openedModels,
    active_model: state.activeModel,
    show_preview: state.showPreview,
  }
}

export function checkDirty(state: ReplStoredState, savedState: ReplStoredState) {
  const a = toUpdatePayload(state)
  const b = toUpdatePayload(savedState)
  return !deepEqual(a, b)
}

export function checkEffectivelyDirty(state: ReplStoredState, savedState: ReplStoredState) {
  const a = toUpdatePayload(state)
  const b = toUpdatePayload(savedState)

  delete a.opened_models
  delete a.active_model
  delete a.show_preview

  delete b.opened_models
  delete b.active_model
  delete b.show_preview

  return !deepEqual(a, b)
}
