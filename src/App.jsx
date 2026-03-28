import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./services/supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MLBPredictions from "./pages/MLBPredictions";
import UserPredictions from "./pages/UserPredictions";
import ViewMLBPredictions from "./pages/ViewMLBPredictions";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={session ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/users/:name/mlb"
        element={
          session ? <ViewMLBPredictions /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/users/:name/mlb/edit"
        element={
          session ? <MLBPredictions /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/users/:name/:sport"
        element={
          session ? <UserPredictions /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
