
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { user, logout } = useAuth();

  const onSuccess = async function(response: any) {
    const googleToken = response.credential;
    console.log(response);

    const res = await fetch("http://localhost:3000/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken }),
      credentials: "include", // Posílání cookies
    });

    const data = await res.json();

    if (data.success) {
      console.log('Login Successful.');
      console.log(user);
    }

    console.log(data);
    window.location.reload(); // Obnovit aplikaci pro načtení session
  }

  const onFailure = () => {
    console.error('Login Failed.');
  };

  return (
    <>
      <GoogleLogin onSuccess={onSuccess} onError={onFailure}/>
    </>
  )
}

export default Login;