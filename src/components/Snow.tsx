'use client'

import Snowfall from 'react-snowfall'

export default function Snow() {
  return (
    <Snowfall
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}
