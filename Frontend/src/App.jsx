import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Produtos from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import StockEntry from "./pages/StockEntry";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Sidebar from "./components/Layout/Sidebar";
import Topbar from "./components/Layout/Topbar";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import "./styles/layout.css";
import ReportsEtoque from "./pages/ReportsEtoque";
import Users from "./pages/Users";
import Assinatura from "./pages/Assinatura";
import Unidades from "./pages/Unidades";
import Profile from "./pages/Profile";
import BoxFlash from "./pages/BoxFlash";
import ActivateAccount from "./components/ActivateAccount";

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/ativar" element={<ActivateAccount />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }


  function toggleSidebar() {
    setIsSidebarOpen((prev) => !prev);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <Sidebar isMobileOpen={isSidebarOpen} closeMobileMenu={closeSidebar} />

      {/* BACKDROP escuro atrás do menu no mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      {/* MAIN */}
      <div className="layout-main">
        <Topbar onToggleSidebar={toggleSidebar} />

        <div className="layout-content">
          <ToastContainer autoClose={3000} position="top-right" />

          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <PrivateRoute>
                  <Produtos />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute roles={["super_admin", "admin"]}>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/assinatura"
              element={
                <PrivateRoute role={["super_admin", "admin", "supervisor"]}>
                  <Assinatura />
                </PrivateRoute>
              }
            />
            <Route
              path="/estoques"
              element={
                <PrivateRoute role={["super_admin", "admin"]}>
                  <Warehouses />
                </PrivateRoute>
              }
            />
            <Route
              path="/unidades"
              element={
                <PrivateRoute role={["super_admin", "admin"]}>
                  <Unidades />
                </PrivateRoute>
              }
            />
            <Route
              path="/entrada"
              element={
                <PrivateRoute>
                  <StockEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/saida"
              element={
                <PrivateRoute>
                  <BoxFlash />
                </PrivateRoute>
              }
            />

            <Route
              path="/relatorio-movimentacao"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/relatorio-estoque"
              element={
                <PrivateRoute>
                  <ReportsEtoque />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
