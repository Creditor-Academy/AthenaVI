function Login({ onSuccess }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSuccess) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="chk" aria-hidden="true">
        Login
      </label>

      <input
        id="signin-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        required
      />

      <input
        id="signin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        required
      />

      <button type="submit">
        Login
      </button>
    </form>
  )
}

export default Login

