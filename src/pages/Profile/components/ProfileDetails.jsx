import { useEffect, useRef, useState } from 'react'
import { MdClose, MdEdit, MdEmail, MdExpandMore, MdPerson, MdPhone, MdSave, MdVerifiedUser } from 'react-icons/md'
import { COUNTRIES, digitRangeLabel, parseStoredPhone } from '../profileUtils'

/** Inline-editable name + phone rows. `editTick` (bumped by "Edit details") opens the name field. */
export default function ProfileDetails({ profile, saving, editTick = 0, onSave, onError }) {
  const [editing, setEditing] = useState(null)
  const [nameValue, setNameValue] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0])
  const [phoneDigits, setPhoneDigits] = useState('')
  const [countryOpen, setCountryOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryRef = useRef(null)

  const startEdit = (field) => {
    setEditing(field)
    setCountryOpen(false)
    setCountrySearch('')
    if (field === 'name') setNameValue(profile.name || '')
    if (field === 'phoneNumber') {
      const parsed = parseStoredPhone(profile.phoneNumber)
      setCountry(parsed.country)
      setPhoneDigits(parsed.number)
    }
  }

  const [seenTick, setSeenTick] = useState(editTick)
  if (seenTick !== editTick) {
    setSeenTick(editTick)
    startEdit('name')
  }

  useEffect(() => {
    if (!countryOpen) return undefined
    const onDown = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false)
        setCountrySearch('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [countryOpen])

  const cancel = () => {
    setEditing(null)
    setCountryOpen(false)
    setCountrySearch('')
  }

  const save = async () => {
    let value = nameValue.trim()
    if (editing === 'phoneNumber') {
      const digits = phoneDigits.replace(/\D/g, '')
      const [min, max] = country.digits
      if (digits && (digits.length < min || digits.length > max)) {
        onError(`${country.name} phone numbers must be ${digitRangeLabel(country.digits)} digits.`)
        return
      }
      value = digits ? `+${country.dial}${digits}` : ''
    }
    const ok = await onSave(editing, value)
    if (ok) cancel()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      cancel()
    }
  }

  const editActions = (
    <div className="prf-edit-actions">
      <button type="button" className="prf-icon-btn is-primary" onClick={save} disabled={saving} title="Save">
        <MdSave size={18} />
      </button>
      <button type="button" className="prf-icon-btn" onClick={cancel} disabled={saving} title="Cancel">
        <MdClose size={18} />
      </button>
    </div>
  )

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch.replace(/^\+/, ''))
  )

  return (
    <div className="prf-detail-list">
      <div className="prf-detail">
        <span className="prf-detail-ico" aria-hidden>
          <MdEmail />
        </span>
        <div className="prf-detail-body">
          <span className="prf-detail-label">Email address</span>
          <span className="prf-detail-value">{profile.email || '—'}</span>
        </div>
        <MdVerifiedUser className="prf-detail-verified" size={20} title="Verified" />
      </div>

      <div className={`prf-detail${editing === 'name' ? ' is-editing' : ''}`}>
        <span className="prf-detail-ico" aria-hidden>
          <MdPerson />
        </span>
        <div className="prf-detail-body">
          <span className="prf-detail-label">Full name</span>
          {editing === 'name' ? (
            <div className="prf-edit-row">
              <input
                className="prf-input"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Enter your name"
                aria-label="Full name"
                autoFocus
              />
              {editActions}
            </div>
          ) : (
            <span className={`prf-detail-value${profile.name ? '' : ' is-empty'}`}>
              {profile.name || 'Add your name'}
            </span>
          )}
        </div>
        {editing !== 'name' && (
          <button type="button" className="prf-icon-btn" onClick={() => startEdit('name')} title="Edit name">
            <MdEdit size={16} />
          </button>
        )}
      </div>

      <div className={`prf-detail${editing === 'phoneNumber' ? ' is-editing' : ''}`}>
        <span className="prf-detail-ico" aria-hidden>
          <MdPhone />
        </span>
        <div className="prf-detail-body">
          <span className="prf-detail-label">Phone number</span>
          {editing === 'phoneNumber' ? (
            <>
              <div className="prf-edit-row">
                <div className="prf-phone">
                  <div className="prf-country" ref={countryRef}>
                    <button
                      type="button"
                      className={`prf-country-trigger${countryOpen ? ' is-open' : ''}`}
                      onClick={() => {
                        setCountryOpen((o) => !o)
                        setCountrySearch('')
                      }}
                      aria-haspopup="listbox"
                      aria-expanded={countryOpen}
                      title="Select country code"
                    >
                      <strong>{country.code}</strong>
                      <span>+{country.dial}</span>
                      <MdExpandMore size={14} aria-hidden />
                    </button>
                    {countryOpen && (
                      <div className="prf-country-menu">
                        <input
                          className="prf-country-search"
                          autoFocus
                          type="text"
                          placeholder="Search country…"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                        />
                        <div className="prf-country-list" role="listbox">
                          {filteredCountries.map((c) => (
                            <button
                              type="button"
                              role="option"
                              aria-selected={c.code === country.code}
                              key={c.code}
                              className={`prf-country-option${c.code === country.code ? ' is-selected' : ''}`}
                              onClick={() => {
                                setCountry(c)
                                setPhoneDigits('')
                                setCountryOpen(false)
                                setCountrySearch('')
                              }}
                            >
                              <span aria-hidden>{c.flag}</span>
                              <span className="prf-country-name">{c.name}</span>
                              <span className="prf-country-dial">+{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    className="prf-input"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, country.digits[1]))}
                    onKeyDown={onKeyDown}
                    placeholder={`${digitRangeLabel(country.digits)} digits`}
                    maxLength={country.digits[1]}
                    type="tel"
                    inputMode="numeric"
                    aria-label="Phone number"
                    autoFocus
                  />
                </div>
                {editActions}
              </div>
              <span className="prf-hint">
                {country.name} · +{country.dial} · {digitRangeLabel(country.digits)} digits
              </span>
            </>
          ) : (
            <span className={`prf-detail-value${profile.phoneNumber ? '' : ' is-empty'}`}>
              {profile.phoneNumber || 'Add phone number'}
            </span>
          )}
        </div>
        {editing !== 'phoneNumber' && (
          <button
            type="button"
            className="prf-icon-btn"
            onClick={() => startEdit('phoneNumber')}
            title="Edit phone number"
          >
            <MdEdit size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
