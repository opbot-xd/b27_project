import { useState, ChangeEvent, FormEvent } from 'react'
import {Navigate} from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import CryptoJs from 'crypto-js'

const Signup = () => {
  axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
  axios.defaults.xsrfCookieName = "csrftoken";
  const SIGNUP_URL: string = import.meta.env.VITE_SIGNUP_URL as string
  interface Signup {
    username: string,
    password: string,
    email: string
  }

  const [formData, setFormdata] = useState<Signup>({ username: "", password: "", email: "" })
  const [successfulSignup, isSignupSuccessful] = useState<boolean>(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormdata((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let password: string = formData.password
    try {
      password = CryptoJs.SHA256(password).toString(CryptoJs.enc.Hex)
      setFormdata({password:password, username:formData.username, email:formData.email})
    } catch (err) {
      console.error({ message: err })
    }

    try {
      const response: AxiosResponse<any, any> = await axios.post(SIGNUP_URL, formData, {withCredentials: true})
      console.log(response)
      localStorage.setItem("username",formData.username)
      sessionStorage.setItem("access_token", response.data["access_token"])
      isSignupSuccessful(true)
    }
    catch (err) {
      alert('signup unsuccessful, please try again')
      console.error({ error: err })
    }
  };

  if(successfulSignup){
    return <Navigate to = '/home'/>
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Username:</label><br />
      <input
        type='text'
        name="username"
        value={formData.username}
        onChange={handleChange}
      /><br /><br />
      <label>Email:</label><br />
      <input
        type='text'
        name="email"
        value={formData.email}
        onChange={handleChange}
      /><br /><br />
      <label>Password:</label><br />
      <input
        type='password'
        name="password"
        value={formData.password}
        onChange={handleChange}
      /><br /><br />
      <button>Signup!</button>
    </form>
  )
}
export default Signup
