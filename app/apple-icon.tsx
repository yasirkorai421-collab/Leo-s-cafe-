import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
// Apple Icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#c8a87e',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
      >
        L
      </div>
    ),
    {
      ...size,
    }
  )
}
