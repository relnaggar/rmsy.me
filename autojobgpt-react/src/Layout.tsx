import { Outlet, Link } from "react-router-dom";

export default function Layout(): JSX.Element {
  return (
    <>
      <h1>AutoJobGPT</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Jobs</Link>
          </li>
          <li>
            <Link to="/resumes">Resumes</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
}