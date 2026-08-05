import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#000000', 
          borderRadius: '40px' 
        }}
      >
        <div 
          style={{ 
            display: 'flex', 
            fontSize: 64, 
            fontWeight: 900, 
            letterSpacing: '6px', 
            color: '#FFFFFF',
            fontFamily: 'sans-serif' 
          }}
        >
          DUO
        </div>
      </div>
    ), { ...size }
  )
}
