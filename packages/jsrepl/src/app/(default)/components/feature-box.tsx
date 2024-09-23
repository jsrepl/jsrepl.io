import React from 'react'

interface FeatureBoxProps {
  icon: React.ReactNode
  title: React.ReactNode
  description: React.ReactNode
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-[#202127] p-6 text-white/85">
      <div className="bg-background flex h-12 w-12 items-center justify-center rounded-sm">
        {icon}
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}

export default FeatureBox
