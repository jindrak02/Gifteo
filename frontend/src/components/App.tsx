import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './Login';
import NavPanel from './NavPanel';
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import MyPeople from './MyPeople';

const CLIENT_ID = '1015554226649-g1s15ss5ovk1p583m24mp6upqb7f1q9b.apps.googleusercontent.com';

const App = () => {
  const { user } = useAuth();

  if (user == null) {
    return (
      <>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </GoogleOAuthProvider>
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>

        <Routes>
          <Route path="/" element={<Navigate to="/profile" />} />
          <Route path="profile" element={<Profile/>} />
          <Route path="people" element={<MyPeople/>} />
          <Route path="hub" element={<h1>Wishlist Hub</h1>} />
          <Route path="calendar" element={<h1>My Calendar</h1>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <NavPanel/>
    </GoogleOAuthProvider>
  );
}

export default App;
