import { GoogleOAuthProvider } from '@react-oauth/google';
import { InvitationProvider } from './store/InvitationContext.tsx';
import Login from './features/Login/Login.tsx';
import NavPanel from './components/ui/NavPanel.tsx';
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from './store/AuthContext';
import Profile from './features/Profile/Profile.tsx';
import MyPeople from './features/MyPeople/MyPeople.tsx';
import WishlistHub from './features/WishlistHub/WishlistHub.tsx';
import MyIdeas from './features/MyIdeas/MyIdeas.tsx';
import Calendar from './features/Calendar/Calendar.tsx';
import LandingPage from './features/Landing/LandingPage.tsx';
import ViewWishlist from './features/viewWishlist/viewWishlist.tsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => {
  const { user } = useAuth();

  if (user == null) {
    return (
      <>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="view-wishlist" element={<ViewWishlist />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </GoogleOAuthProvider>
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <InvitationProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/profile" />} />
          <Route path="profile" element={<Profile/>} />
          <Route path="people" element={<MyPeople/>} />
          <Route path="hub" element={<WishlistHub />} />
          <Route path="ideas" element={<MyIdeas/>} />
          <Route path="calendar" element={<Calendar/>} />
          <Route path="view-wishlist" element={<ViewWishlist />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <NavPanel/>
      </InvitationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
