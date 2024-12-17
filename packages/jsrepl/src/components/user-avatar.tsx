'use client'

import { User } from '@supabase/supabase-js'
import { LucideCircleUserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UserAvatar({
  user,
  size = 28,
  className,
}: {
  user: User | { avatar_url: string | null; user_name: string | null } | null
  size?: number
  className?: string
}) {
  const userName: string | null | undefined = user
    ? 'user_metadata' in user
      ? user.user_metadata.name
      : user?.user_name
    : undefined

  const avatarUrl: string | null | undefined = user
    ? 'user_metadata' in user
      ? user.user_metadata.avatar_url
      : user?.avatar_url
    : undefined

  return avatarUrl ? (
    <img
      className={cn('rounded-full', className)}
      width={size}
      height={size}
      src={avatarUrl}
      alt={`${userName ?? 'User'} avatar`}
    />
  ) : (
    <LucideCircleUserRound size={size} strokeWidth={1.5} className={cn('p-0.5', className)} />
  )
}
