import React, { SVGProps } from 'react'

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="-37"
        y="34.5"
        width="74"
        height="30"
        rx="15"
        transform="rotate(-45)"
        fill="var(--logo-a, #AF9750)"
        stroke="var(--logo-a, #AF9750)"
        strokeWidth="5"
      />
      <rect
        x="-37"
        y="34.5"
        width="30"
        height="30"
        rx="15"
        transform="rotate(-45)"
        fill="var(--logo-b, black)"
        stroke="var(--logo-a, #AF9750)"
        strokeWidth="5"
      />
      <rect
        x="-37"
        y="77"
        width="74"
        height="30"
        rx="15"
        transform="rotate(-45)"
        fill="var(--logo-a, #AF9750)"
        stroke="var(--logo-a, #AF9750)"
        strokeWidth="5"
      />
      <rect
        x="7"
        y="77"
        width="30"
        height="30"
        rx="15"
        transform="rotate(-45)"
        fill="var(--logo-b, black)"
        stroke="var(--logo-a, #AF9750)"
        strokeWidth="5"
      />
    </svg>
  )
}
