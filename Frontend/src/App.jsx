import RootLayout from './layout/RootLayout'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserAuthForms from './pages/UserAuthForm'
import Login from './Components/Login'
import Register from './Components/Register'
import RecoverAccount from './Components/RecoverAccount'
import MyProfile from './pages/MyProfile'
import { RightSidebarProvider } from './context/RightSidebarProvider'
import ManageUsers from './pages/ManageUsers'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './Components/ProtectedRoute'
import { UpdateDataProvider } from './context/UpdateDataProvider'
import UserProfile from './pages/UserProfile'
import PasswordReset from './Components/PasswordReset'
import VerifyEmail from './pages/VerifyEmail'
import UserIngredients from './pages/UserIngredients'
import NotFound404 from './pages/NotFound404'
import RecipeDetails from './pages/RecipeDetails'

function App() {

  return (
    <AuthProvider>
      <RightSidebarProvider>
        <UpdateDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<RootLayout/>}>
                <Route path='auth' element={<UserAuthForms/>}>
                  <Route path='iniciar-sesion' element={<Login/>}/>
                  <Route path='registrarse' element={<Register/>}/>
                  <Route path='password_reset/:token' element={<PasswordReset/>}/>
                  <Route path='recuperar-cuenta' element={<RecoverAccount/>}/>
                </Route>
                <Route element={<ProtectedRoute/>}>
                  <Route path='mi-perfil' element={<MyProfile/>}/>
                  <Route path='ingredientes' element={<UserIngredients/>}/>
                </Route>
                <Route path='users' element={<ManageUsers/>}/>
                <Route path='receta/:recipe_id' element={<RecipeDetails/>}/>
                <Route path='user/:user_id' element={<UserProfile/>}/>
                <Route path='verify_email/:token' element={<VerifyEmail/>}/>
                <Route path='*' element={<NotFound404/>}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </UpdateDataProvider>
      </RightSidebarProvider>
    </AuthProvider>
  )
}

export default App