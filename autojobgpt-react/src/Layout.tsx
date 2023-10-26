import { Outlet, Link } from "react-router-dom";


export default function Layout(): React.JSX.Element {
  return (
    <div className="container">

      <nav className="navbar navbar-expand bg-body-tertiary">
        <div className="container-fluid justify-content-start">
          <Link to="/" className="navbar-brand">AutoJobGPT</Link>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/jobs" className="nav-link">Jobs</Link>
            </li>
            <li className="nav-item">
              <Link to="/resumes" className="nav-link">Resumes</Link>
            </li>
          </ul>
        </div>
        <ul className="navbar-nav">
          <li className="nav-item">
            <a href="/autojobgpt/api" className="nav-link">API</a>
          </li>
          <li className="nav-item">
          <a href="/autojobgpt/admin" className="nav-link">Admin</a>
          </li>
        </ul>
      </nav>

      <Outlet />

    </div>
  )
}