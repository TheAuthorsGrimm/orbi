import { Routes, Route, Navigate } from "react-router-dom";

// Placeholder pages — replace with real implementations
function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          <span className="text-orbi-purple">🔮 Orbi</span>
        </h1>
        <p className="text-orbi-muted mb-6 text-sm">ADHD Productivity Companion</p>
        <p className="text-orbi-teal text-sm">Backend running — start building your auth flow!</p>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold text-orbi-purple">Dashboard</h1>
      <p className="text-orbi-muted mt-2">Your Orbi workspace is ready.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
