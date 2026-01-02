import { useState } from 'react'
import Login from '../components/authentication/Login.jsx'
import Signup from '../components/authentication/Signup.jsx'

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@500&display=swap');

.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  background: linear-gradient(to bottom, #0a1c3f, #0f3a8c, #0c2d64);
  font-family: 'Jost', sans-serif;
}

.main {
  width: 350px;
  height: 500px;
  background: url("https://doc-08-2c-docs.googleusercontent.com/docs/securesc/68c90smiglihng9534mvqmq1946dmis5/fo0picsp1nhiucmc0l25s29respgpr4j/1631524275000/03522360960922298374/03522360960922298374/1Sx0jhdpEpnNIydS4rnN4kHSJtU1EyWka?e=view&authuser=0&nonce=gcrocepgbb17m&user=03522360960922298374&hash=tfhgbs86ka6divo3llbvp93mg4csvb38") no-repeat center/cover;
  border-radius: 10px;
  box-shadow: 5px 20px 50px #000;
  overflow: hidden;
  position: relative;
}

#chk {
  display: none;
}

.signup {
  position: relative;
  width: 100%;
  height: 100%;
}

label {
  color: #fff;
  font-size: 2.3em;
  display: flex;
  justify-content: center;
  margin: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.5s ease-in-out;
}

input {
  width: 60%;
  height: 10px;
  background: #e0dede;
  display: flex;
  justify-content: center;
  margin: 20px auto;
  padding: 12px;
  border: none;
  outline: none;
  border-radius: 5px;
}

button {
  width: 60%;
  height: 40px;
  margin: 10px auto;
  display: block;
  color: #fff;
  background: linear-gradient(135deg, #2d6cf6 0%, #5cc6ff 100%);
  font-size: 1em;
  font-weight: bold;
  margin-top: 30px;
  outline: none;
  border: none;
  border-radius: 5px;
  transition: 0.2s ease-in;
  cursor: pointer;
}

button:hover {
  background: linear-gradient(135deg, #1f5adc 0%, #4bb4f0 100%);
}

.login {
  height: 460px;
  background: #eee;
  border-radius: 60% / 10%;
  transform: translateY(-180px);
  transition: 0.8s ease-in-out;
}

.login label {
  color: #1f4bc2;
  transform: scale(0.6);
}

#chk:checked ~ .login {
  transform: translateY(-500px);
}

#chk:checked ~ .login label {
  transform: scale(1);
}

#chk:checked ~ .signup label {
  transform: scale(0.6);
}
`

function Auth({ onAuthComplete, onBackToHero }) {
  const [activeTab, setActiveTab] = useState('signin')

  const handleToggle = (event) => {
    setActiveTab(event.target.checked ? 'signup' : 'signin')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Home Icon Button */}
        <button
          onClick={onBackToHero}
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            width: '50px',
            height: '50px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)'
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)'
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
            e.target.style.transform = 'scale(1)'
          }}
          aria-label="Go to home"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        <div className="main">
          <input
            type="checkbox"
            id="chk"
            aria-hidden="true"
            checked={activeTab === 'signup'}
            onChange={handleToggle}
          />

          <div className="signup">
            <Signup onSuccess={onAuthComplete} />
          </div>

          <div className="login">
            <Login onSuccess={onAuthComplete} />
          </div>
        </div>
      </div>
    </>
  )
}

export default Auth

