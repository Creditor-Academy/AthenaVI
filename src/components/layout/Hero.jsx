import { useEffect, useState } from 'react'
import { MdArrowOutward } from 'react-icons/md'
import avatar1 from '../../assets/Avatarr1.png'
import avatar2 from '../../assets/Avatarr2.png'
import avatar3 from '../../assets/Avatarr3.png'
import avatar4 from '../../assets/Avatarr4.png'
import avatar5 from '../../assets/Avatarr5.png'

import HeroArcGallery from './HeroArcGallery'
import heygenService from '../../services/heygenService'
import { extractHeygenList, mapAvatarGroup } from '../../utils/heygenAvatars'

const styles = `
.hero-container {
  width: 100%;
  min-height: auto;
  background: radial-gradient(circle at 50% 30%, #0b1a40 0%, #060d24 55%, #020412 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #f1f5f9;
  padding-top: 64px;
}

/* Luxury glowing mesh grid overlay */
.hero-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: center;
  pointer-events: none;
  mask-image: radial-gradient(circle at 50% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 30%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
  z-index: 1;
}

/* Subtle glowing abstract light source */
.hero-container::after {
  content: "";
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 350px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.03) 70%, transparent 100%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 2;
}

.hero-copy {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 10;
}

.hero-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 16px;
}

.hero-title {
  font-family: 'Inter', sans-serif;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 75%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 20px;
  line-height: 1.15;
  letter-spacing: -1.5px;
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: clamp(16px, 2vw, 18px);
  color: #94a3b8;
  margin: 0 auto 36px;
  font-weight: 400;
  line-height: 1.7;
  max-width: 580px;
}

.hero-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-cta .btn-primary {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #ffe082 0%, #ffb300 50%, #ff8f00 100%);
  border: none;
  color: #030712;
  padding: 14px 30px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(255, 179, 0, 0.35);
  letter-spacing: 0.5px;
}

.hero-cta .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 179, 0, 0.5), 0 0 15px rgba(255, 224, 130, 0.2);
  background: linear-gradient(135deg, #fff3e0 0%, #ffe082 50%, #ffb300 100%);
}

.hero-cta .btn-outline {
  font-family: 'Inter', sans-serif;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #f1f5f9;
  padding: 14px 30px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.hero-cta .btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.05);
}

.hero-gallery-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  overflow: hidden;
  position: relative;
  z-index: 5;
}

.hero-cards-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 40px;
  max-width: 900px;
  margin: 48px auto 64px;
  padding: 0 24px;
  width: 100%;
  position: relative;
  z-index: 5;
}

@media (max-width: 1024px) {
  .hero-cards-row {
    flex-direction: column;
    align-items: center;
    gap: 32px;
    margin: 40px auto 56px;
  }

  .hero-cards-row .left-card-wrapper,
  .hero-cards-row .right-card-container {
    width: 100%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding-top: 48px;
  }

  .hero-copy {
    padding: 0 20px 32px;
  }

  .hero-title {
    font-size: 36px;
    letter-spacing: -1px;
  }

  .hero-subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }

  .hero-cta {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta .btn-primary,
  .hero-cta .btn-outline {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .hero-cards-row {
    margin: 32px auto 48px;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
    line-height: 1.15;
  }

  .hero-subtitle {
    font-size: 15px;
    line-height: 1.55;
  }
}

`

function Hero() {
  const [avatarsList, setAvatarsList] = useState([
    { src: avatar1, name: 'Ethan', role: 'AI Video Assistant' },
    { src: avatar4, name: 'Liam', role: 'Virtual Instructor' },
    { src: avatar2, name: 'Oliver', role: 'Digital Host' },
    { src: avatar5, name: 'Noah', role: 'Technical Expert' },
    { src: avatar3, name: 'Olivia', role: 'Language Coach' },
  ])

  useEffect(() => {
    async function loadPublicAvatars() {
      const token = localStorage.getItem('accessToken');
      console.log('Hero: Fetching public HeyGen avatars... Token present:', !!token);
      if (!token) {
        console.warn('Hero: Access token is missing. HeyGen API requests require authentication. Keeping static fallback avatars.');
        return;
      }
      try {
        const groupsRes = await heygenService.getAvatarGroups({ ownership: 'public', limit: 6 })
        console.log('Hero: getAvatarGroups response:', groupsRes)
        const groups = extractHeygenList(groupsRes, ['avatar_groups', 'groups'])
          .map(mapAvatarGroup)
          .filter((g) => g.id)
          .slice(0, 6)

        console.log('Hero: Mapped public avatar groups:', groups)
        if (groups.length === 0) {
          console.warn('Hero: No avatar groups found or filtered out')
          return
        }

        // For each group, fetch its looks using the looks API
        const fetchedAvatars = await Promise.all(
          groups.map(async (group) => {
            try {
              console.log(`Hero: Fetching looks for group ${group.id}...`)
              const looksRes = await heygenService.getAvatarLooks({
                group_id: group.id,
                ownership: 'public',
                limit: 1,
              })
              console.log(`Hero: Looks response for group ${group.id}:`, looksRes)
              const looks = extractHeygenList(looksRes, ['avatar_looks', 'looks'])
              if (looks && looks.length > 0) {
                const look = looks[0]
                const image = look.preview_image_url || look.thumbnail_url || look.normal_image_url || look.image_url || group.image
                return {
                  src: image,
                  name: look.avatar_name || look.name || group.name,
                  role: group.subtitle || 'AI Presenter',
                }
              }
            } catch (err) {
              console.warn(`Failed to fetch looks for avatar group ${group.id}:`, err)
            }
            return {
              src: group.image,
              name: group.name,
              role: group.subtitle || 'AI Presenter',
            }
          })
        )

        const validFetched = fetchedAvatars.filter(av => av && av.src)
        console.log('Hero: Setting avatars list to:', validFetched)
        if (validFetched.length > 0) {
          setAvatarsList(validFetched)
        }
      } catch (error) {
        console.error('Failed to load public avatars from HeyGen API:', error)
      }
    }

    loadPublicAvatars()
  }, [])


  return (
    <>
      <style>{styles}</style>
      <div className="hero-container">
        <div className="hero-copy">
          <h1 className="hero-title">
            Create AI-Powered Videos
            <br />
            That Speak Your Language
          </h1>
          <p className="hero-subtitle">
            Transform text into engaging video content with lifelike AI avatars.
            Create professional videos in minutes, not hours.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn-primary">
              START FREE TRIAL
              <MdArrowOutward />
            </button>
            <button type="button" className="btn-outline">
              CONTACT SALES
              <MdArrowOutward />
            </button>
          </div>
        </div>

        <div className="hero-gallery-bleed">
          <HeroArcGallery avatars={avatarsList} fullWidth />
        </div>
      </div>
    </>
  )
}

export default Hero
