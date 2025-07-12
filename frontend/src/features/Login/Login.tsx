import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/AuthContext';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../utils/fetchApi';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { user, logout } = useAuth();
  const [nameDay, setNameDay] = useState('TODO');
  const { t } = useTranslation();

  // TODO: Fetch name day
  // useEffect(() => {
  //   const fetchNameDay = async () => {
  //     const res = await fetch('https://api.abalin.net/today?country=cz');
  //     const data = await res.json();
  //     setNameDay(data.data.namedays.cz);
  //   };
  //   fetchNameDay();
  // }, []);

  const onSuccess = async function(response: any) {
    const googleToken = response.credential;

    const res = await fetchApi("auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken }),
      credentials: "include", // Posílání cookies
    });

    const data = await res.json();

    if (!data.success) {
      console.log(data);
    } else {
      window.location.reload(); // Obnovit aplikaci pro načtení session
    }
  }

  const onFailure = () => {
    console.error('Login Failed.');
  };

  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <div className='flex-container login'>
        <div className="login-container">
          <img src='images/icon.png' alt="Gifteo icon" className='icon-main my-2'/>
          <h1 className="login-title">{t('login.welcome')}</h1>
          <hr className="divider" />
          <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
          {/* <p className="name-day-info text-center">Todays date is {today}. Nameday has {nameDay}.</p> */}
        </div>
      </div>
    </>
  );
}

export default Login;