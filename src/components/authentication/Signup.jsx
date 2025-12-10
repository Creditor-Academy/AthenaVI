function Signup({ onSuccess }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="chk" aria-hidden="true">
        Sign up
      </label>

      <input
        id="signup-username"
        name="username"
        type="text"
        placeholder="User name"
        required
      />

      <input
        id="signup-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        required
      />

      <input
        id="signup-phone"
        name="phone"
        type="number"
        placeholder="Phone Number"
        required
      />

      <input
        id="signup-password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Password"
        required
      />

      <button type="submit">
        Sign up
      </button>
    </form>
  )
}

export default Signup

