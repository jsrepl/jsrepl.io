import React from 'react'

interface LandingDemoProps {
  replLink?: string
  title?: React.ReactNode
  text?: React.ReactNode
  media?: (props: {
    videoProps: React.VideoHTMLAttributes<HTMLVideoElement>
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  }) => React.ReactNode
}

const LandingDemo: React.FC<LandingDemoProps> = ({ replLink, title, text, media }) => {
  const videoProps: React.VideoHTMLAttributes<HTMLVideoElement> = {
    width: '840',
    height: '420',
    autoPlay: true,
    muted: true,
    loop: true,
    className: 'min-w-0 flex-1 rounded-md border border-border shadow-xl',
  }

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    width: '840',
    height: '420',
    className: 'min-w-0 flex-1 rounded-md border border-border shadow-xl',
    loading: 'lazy',
  }

  return (
    <div className="flex items-start gap-x-2 gap-y-4 max-lg:flex-col">
      <div className="text-muted-foreground flex flex-shrink-0 flex-col gap-3 lg:w-1/3 lg:p-6">
        <h2 className="text-foreground/85 text-2xl font-semibold">{title}</h2>
        {text}
        {replLink && (
          <p>
            <a href={replLink} target="_blank" className="underline underline-offset-4">
              Try it yourself
            </a>
          </p>
        )}
      </div>
      {media && media({ videoProps, imgProps })}
    </div>
  )
}

export default LandingDemo
