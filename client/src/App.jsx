// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import your pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import CalendarDashboard from './pages/CalendarDashboard';
import OfferRide from './pages/OfferRide';
import RideDetail from './pages/RideDetail';
import MyRides from './pages/MyRides';
import Agenda from './pages/Agenda';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfile from './pages/PublicProfile';
import AdminRoute from './components/AdminRoute';
import AdminPage from './pages/AdminPage';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RideRequests from './pages/RideRequests';
import VerifyEmail from './pages/VerifyEmail';
import VerifyPending from './pages/VerifyPending';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: "red", backgroundColor: "#ffe6e6", border: "1px solid red", margin: 20}}>
          <h2>🚨 Render Error Detected</h2>
          <details>
            <summary>Error Details</summary>
            <pre style={{whiteSpace: 'pre-wrap', fontSize: '12px'}}>
              {String(this.state.error)}
            </pre>
            {this.state.errorInfo && (
              <pre style={{whiteSpace: 'pre-wrap', fontSize: '10px', marginTop: 10}}>
                Component Stack: {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-pending" element={<VerifyPending />} />

            {/* Protected Routes */}
            <Route path="dashboard" element={<ProtectedRoute element={CalendarDashboard} />} />
            <Route path="offer-ride" element={<ProtectedRoute element={OfferRide} />} />
            <Route path="/my-rides" element={<ProtectedRoute element={MyRides} />} />
            <Route path="agenda" element={<ProtectedRoute element={Agenda} />} />
            <Route path="ride/:rideId" element={<ProtectedRoute element={RideDetail} />} />
            <Route path="/ride-requests" element={<ProtectedRoute element={RideRequests} />} />
            <Route path="notifications" element={<ProtectedRoute element={NotificationsPage} />} />
            <Route path="profile" element={<ProtectedRoute element={ProfilePage} />} />
            <Route path="users/:userId" element={<ProtectedRoute element={PublicProfile} />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
