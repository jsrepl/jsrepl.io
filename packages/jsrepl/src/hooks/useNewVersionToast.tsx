import React, { useContext, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { UserStateContext } from '@/context/user-state-context'
import { parseVersion } from '@/lib/semver'

export function useNewVersionToast() {
  const { userState, setUserState } = useContext(UserStateContext)!
  const userVersionRef = useRef(userState.version)

  useEffect(() => {
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION
    const userVersion = userVersionRef.current

    if (!appVersion) {
      return
    }

    if (userVersion !== appVersion) {
      setUserState((state) => ({ ...state, version: appVersion }))
    }

    // Skip on first launch (userVersion is undefined).
    // Skip patch version updates (bug fixes only).
    if (!userVersion || !isMajorOrMinorUpdated(userVersion, appVersion)) {
      return
    }

    let toastId: string | number | undefined

    const timeoutId = setTimeout(async () => {
      toastId = toast(`Updated to version ${appVersion}`, {
        description: (
          <a
            href={`https://github.com/jsrepl/jsrepl.io/releases/tag/${appVersion}`}
            target="_blank"
            className="hover:text-primary underline underline-offset-4"
            onClick={() => {
              toast.dismiss(toastId)
            }}
          >
            View the Release Notes
          </a>
        ),
        cancel: {
          label: 'Close',
          onClick: () => {},
        },
        duration: Infinity,
        closeButton: false,
      })
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
      if (toastId) {
        toast.dismiss(toastId)
      }
    }
  }, [setUserState])
}

function isMajorOrMinorUpdated(userVersion: string, appVersion: string) {
  if (userVersion === appVersion) {
    return false
  }

  const userVersionData = parseVersion(userVersion)
  if (!userVersionData) {
    return false
  }

  const appVersionData = parseVersion(appVersion)
  if (!appVersionData) {
    return false
  }

  return (
    appVersionData.major > userVersionData.major ||
    (appVersionData.major === userVersionData.major && appVersionData.minor > userVersionData.minor)
  )
}
