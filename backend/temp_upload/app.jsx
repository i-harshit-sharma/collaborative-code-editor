import { useState } from 'react';
import Navbar from '../Components/navbar';
import { LoggedIn } from '../Components/loggedIn';
import "../output.css"
function Main() {
  // State management for user login, profile, and theme mode
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    email: '',
    username: '',
    image: '',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle user login/logout
  const toggleLogin = () => {
    if (isLoggedIn) {
      setUser({ email: '', username: '', image: '' });
    } else {
      setUser({
        email: 'mail@gmail.com',
        username: 'Hashit Sharma',
        image: 'https://images.unsplash.com/photo-1736598734718-daa665cc511c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      });
    }
    setIsLoggedIn(!isLoggedIn);
  };

  // Handle theme mode toggle
  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
      {/* Navbar */}
      <Navbar
        logIn={isLoggedIn}
        email={user.email}
        image={user.image}
        username={user.username}
        mode={isDarkMode}
        handleMode={toggleMode}
        signoutSignal={() => toggleLogin(false)}
      />

      {/* Main Content */}
      <div className="container mx-auto py-6">
        <div className="mt-6">
          <LoggedIn />
        </div>

        {/* User Info Display */}
        <button onClick={(e)=>toggleLogin(!isLoggedIn)}>Log kIn</button>
        <div className="mt-6 ">
          <p><strong>Logged In:</strong> {isLoggedIn.toString()}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Theme Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}</p>
        </div>
      </div>
    </div>
  );
}

export default Main;
