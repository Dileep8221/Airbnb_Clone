import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "text-sm",
      "transition-colors",
      isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900",
    ].join(" ");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
              A
            </div>
            <span className="text-base font-semibold tracking-tight">
              Airbnb Clone
            </span>
          </Link>

          {/* Main nav */}
          <nav className="flex items-center gap-5">
            <NavLink to="/listings" className={navLinkClass}>
              Stays
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
        )}

            {user && (
              <NavLink to="/trips" className={navLinkClass}>
                Trips
              </NavLink>
            )}

            <NavLink to="/listings/new" className={navLinkClass}>
              Become a host
            </NavLink>

            <span className="h-6 w-px bg-slate-200" />

            {loading ? (
              <span className="text-xs text-slate-500">
                Checking session…
              </span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-tr from-rose-500 to-orange-400 text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium leading-none">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-slate-700 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} Airbnb Clone</span>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <button className="text-slate-500 hover:text-slate-800">
              Privacy
            </button>
            <button className="text-slate-500 hover:text-slate-800">
              Terms
            </button>
            <button className="text-slate-500 hover:text-slate-800">
              Help
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">English (IN)</span>
            <span>·</span>
            <span className="text-slate-500">INR ₹</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
