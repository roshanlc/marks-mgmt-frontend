import { useContext } from "react"
import "./App.css"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LoginContext } from "./store/LoginProvider"
import { useEffect } from "react"
import {
  checkTokenExpiry,
  decodeToken,
  fetchTokenFromLocalStorage,
  hasTokenInLocalStorage,
} from "./store/LoginMethods"
import { Routes } from "react-router-dom"
import LoginForm from "./components/pages/Login/LoginForm"
import ProtectedRoute from "./components/ProtectedRoute"
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL // fetching from .env file
const tokenValidationUrl = VITE_BACKEND_URL + "/tokens/validate"
import { Link, Route } from "react-router-dom"
import ResponsiveDrawer from "./components/sidebar/ResponsiveDrawer"
import Profile from "./components/pages/Profile/Profile"
import Marks from "./components/pages/marks/Marks"
import Settings from "./components/pages/settings/Settings"
import Dashboard from "./components/pages/dashboard/Dashboard"
import Syllabus from "./components/pages/Syllabus/Syllabus"
import ViewStudents from "./components/pages/students/listStudents/viewStudents"
import ViewTeacherCourses from "./components/pages/teachers/viewCourses/viewTeacherCourses"
import AddCourses from "./components/pages/Admin/addcourses/admincourses"
import ListUsers from "./components/pages/Admin/ListUsers/ListUsers"
import ViewTeachers from "./components/pages/Admin/ViewTeachers"
import AddModifyMarks from "./components/pages/Teacher/AddModifyMarks"
import AcademicDivisions from "./components/pages/Admin/AcademicDivisions"
import CreateBatch from "./components/pages/create-batch/CreateBatch"
import AdminMarks from "./components/pages/Admin/marks/AdminMarks"
import { useNavigate } from "react-router-dom"
import OnlyStudentRoute from "./components/route-protection/OnlyStudentRoute"
import OnlyTeacherRoute from "./components/route-protection/OnlyTeacherRoute"
import OnlyAdminOrExamHeadRoute from "./components/route-protection/OnlyAdminOrExamHeadRoute"

export default function App() {
  const { loginState, dispatchLoginState } = useContext(LoginContext)

  /**
   * Check if the token is valid and does not expire within the next minute
   * @param {String} token
   * @returns boolean
   */
  async function validateToken(token) {
    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const response = await fetch(tokenValidationUrl, {
      method: "POST",
      headers: headers,
    }).catch((error) => {
      toast.warn(
        "Your session could not be validated. Please refresh the page."
      )
      console.log(error)
      dispatchLoginState({ type: "LOGOUT_NETWORK_ISSUE" })
      return
    })

    // status code of response
    const status = await response.status

    if (status === 200) {
      const decodedToken = decodeToken(token)
      // check if expiry time is within next few mins
      // if so then remove it and ask for fresh login
      if (!checkTokenExpiry(decodedToken)) {
        // loop through roles
        const roles = decodedToken.UserRoles.map((item) => {
          return item.role.name
        })
        dispatchLoginState({
          type: "LOGIN",
          payload: {
            token: token,
            roles: {
              hasMultiRoles: roles.length > 1,
              allRoles: roles,
              currentRole: roles[0],
            },
          },
        })
        return
      }
    } else if (status >= 400 && status <= 599) {
      toast.warn("Your session has expired!")
      dispatchLoginState({ type: "LOGOUT" })
    }
  }

  // during page load or refresh
  // check for saved page location
  const navigate = useNavigate()
  useEffect(() => {
    // fetch path from session storage
    const pathFromSession = sessionStorage.getItem("path")
    // redirect to the last page
    if (pathFromSession !== undefined && pathFromSession !== null) {
      navigate(pathFromSession)
    }
  }, [])

  useEffect(() => {
    // if not logged in and there is a token in local storage
    // check for validity
    if (!loginState.isLogged && hasTokenInLocalStorage()) {
      validateToken(fetchTokenFromLocalStorage())
    }

    // Set up interval to check token validation every 5 minutes
    const intervalId = setInterval(() => {
      if (hasTokenInLocalStorage()) {
        validateToken(fetchTokenFromLocalStorage())
      }
    }, 5 * 60 * 1000) // 5 minutes in milliseconds

    // Clean up the interval on component unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <>
      <Routes>
        <Route path="">
          <Route path="/" index element={<LoginForm />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <Profile />
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/marks"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyStudentRoute>
                    <Marks />
                  </OnlyStudentRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <Settings />
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <Dashboard />
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/syllabus"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyStudentRoute>
                    <Syllabus />
                  </OnlyStudentRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacherCourses"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyTeacherRoute>
                    <ViewTeacherCourses />
                  </OnlyTeacherRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <ListUsers />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <ViewStudents />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <ViewTeachers />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/addcourses"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <AddCourses />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/addmarks"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyTeacherRoute>
                    <AddModifyMarks />
                  </OnlyTeacherRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="/divisions"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <AcademicDivisions />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/createbatch"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <CreateBatch />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminmarks"
            element={
              <ProtectedRoute>
                <ResponsiveDrawer>
                  <OnlyAdminOrExamHeadRoute>
                    <AdminMarks />
                  </OnlyAdminOrExamHeadRoute>
                </ResponsiveDrawer>
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <>
                <h1>You are lost!!</h1>
                <h3>
                  <Link to="/">Go to login page!</Link>
                </h3>
              </>
            }
          />
        </Route>
      </Routes>

      {/* Global toast element*/}
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}
