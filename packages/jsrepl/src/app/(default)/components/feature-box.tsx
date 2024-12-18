import React, { useEffect, useRef } from 'react'
import Typed from 'typed.js'

interface FeatureBoxProps {
  icon: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
  code?: React.ReactNode
  codeVariants?: React.ReactNode
}

const FeatureBox: React.FC<FeatureBoxProps> = ({
  icon,
  title,
  description,
  code,
  codeVariants,
}) => {
  const typedRef = useRef<HTMLPreElement>(null)
  const codeVariantsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!typedRef.current || !codeVariantsRef.current) {
      return
    }

    let loopIndex = 0

    const typed = new Typed(typedRef.current, {
      stringsElement: codeVariantsRef.current,
      typeSpeed: 20,
      backSpeed: 10,
      backDelay: 2000,
      smartBackspace: false,
      loop: true,
      // HACK: fix initial text flickering when loop is restarted
      onBegin: (self) => {
        if (loopIndex++ > 0) {
          self.strPos = 0
        }
      },
    })

    return () => {
      typed.destroy()
    }
  }, [])

  return (
    <div className="text-accent-foreground bg-accent/85 flex flex-col gap-4 rounded-xl p-6">
      <div className="bg-background flex h-12 w-12 items-center justify-center rounded-sm">
        {icon}
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
      {code && (
        <pre className="mt-3 text-sm brightness-[0.7] saturate-[3] dark:filter-none">
          <code ref={typedRef}>{code}</code>
        </pre>
      )}
      {codeVariants && (
        <div ref={codeVariantsRef} hidden>
          {codeVariants}
        </div>
      )}
    </div>
  )
}

export default FeatureBox
