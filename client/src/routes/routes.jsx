import Signin from "../layouts/authentication/Signin/index.jsx"
import SignUp from "../layouts/authentication/Sign Up/index.jsx"

const routes = [
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]

export default routes 