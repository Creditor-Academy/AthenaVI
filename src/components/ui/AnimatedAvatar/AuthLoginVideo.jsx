import { useRef, useEffect } from 'react'
import loginVideo from '../../../assets/login.mp4'
import './AuthLoginVideo.css'

function AuthLoginVideo() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.muted = true
    const play = () => {
      video.play().catch(() => {})
    }
    play()
    video.addEventListener('loadeddata', play)
    return () => video.removeEventListener('loadeddata', play)
  }, [])

  return (
    <div className="auth-login-video-shell">
      <video
        ref={videoRef}
        className="auth-login-video"
        src={loginVideo}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        aria-hidden="true"
      />
      <div className="auth-login-video__tint" aria-hidden="true" />
    </div>
  )
}

export default AuthLoginVideo
