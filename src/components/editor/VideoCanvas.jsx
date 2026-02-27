import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Player } from '@remotion/player'
import { MdPlayArrow, MdPause, MdStop, MdZoomIn, MdZoomOut, MdFullscreen } from 'react-icons/md'
import VideoComposition from './VideoComposition'

const VideoCanvas = forwardRef(({ 
  scenes, 
  bgMusic, 
  bgMusicVolume, 
  isPlaying, 
  setIsPlaying, 
  currentTime, 
  setCurrentTime, 
  zoomLevel, 
  setZoomLevel, 
  activeSceneId, 
  setActiveSceneId, 
  totalDurationInFrames, 
  getSceneForFrame, 
  speakText,
  onPlayerReady
}, ref) => {
  const playerRef = useRef(null)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const totalDuration = totalDurationInFrames / 30

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }
  }

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current.seekTo(0)
    }
    setIsPlaying(false)
    setCurrentTime(0)
    window.speechSynthesis.cancel()
  }

  // Notify parent when player is ready
  useImperativeHandle(ref, () => ({
    seekTo: (time) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time * 30)
      }
    },
    getCurrentFrame: () => {
      return playerRef.current ? playerRef.current.getCurrentFrame() : 0
    }
  }))

  useEffect(() => {
    if (playerRef.current && onPlayerReady) {
      onPlayerReady({
        seekTo: (time) => {
          if (playerRef.current) {
            playerRef.current.seekTo(time * 30)
          }
        },
        getCurrentFrame: () => {
          return playerRef.current ? playerRef.current.getCurrentFrame() : 0
        }
      })
    }
  }, [])

  return (
    <div className="canvas-area">
      <div className="preview-container">
        <div className="preview-wrapper">
          <Player
            ref={playerRef}
            component={VideoComposition}
            durationInFrames={Math.max(totalDurationInFrames, 1)}
            compositionWidth={1280}
            compositionHeight={720}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'white'
            }}
            inputProps={{
              scenes: scenes,
              bgMusic: bgMusic,
              bgMusicVolume: bgMusicVolume
            }}
            showOutlines={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onFrameUpdate={(frame) => {
              const time = frame / 30
              setCurrentTime(time)
              const { scene } = getSceneForFrame(frame)
              if (scene && scene.id !== activeSceneId) {
                setActiveSceneId(scene.id)
                if (isPlaying && scene.script) {
                  speakText(scene.script, scene.id)
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
})
export default VideoCanvas;
