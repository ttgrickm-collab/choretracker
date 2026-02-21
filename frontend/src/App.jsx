import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import KidDashboard from './pages/KidDashboard';
import CreateTask from './pages/CreateTask';
import ParentReview from './pages/ParentReview';

function DashboardRouter() {
  const { isParent } = useAuth();
  
  // Route to appropriate dashboard based on role
  if (isParent) {
    return <ParentDashboard />;
  } else {
    return <KidDashboard />;
  }
}

function App() {
  return (
    <BrowserRouter   future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardRouter />} />
            
            <Route 
              path="/tasks/create" 
              element={
                <ProtectedRoute requireParent>
                  <CreateTask />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/review" 
              element={
                <ProtectedRoute requireParent>
                  <ParentReview />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
