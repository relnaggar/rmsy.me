import { Outlet, Link } from "react-router-dom";


export default function Layout(): JSX.Element {
  return (
    <div className="container">
      <nav className="navbar navbar-expand bg-body-tertiary sticky-top">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">AutoJobGPT</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/jobs" className="nav-link">Jobs</Link>
              </li>
              <li className="nav-item">
                <Link to="/resumes" className="nav-link">Resumes</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}