import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

//Usuarios mockeados para simular login
const MOCK_USERS = [
  { email: 'alumno@uas.edu.mx', password: '123456', role: 'alumno' },
  { email: 'administrativo@uas.edu.mx', password: '123456', role: 'administrativo' },
  { email: 'admin@uas.edu.mx', password: '123456', role: 'admin' },
]

export default function LoginPage() {

  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      toast.error('Correo o contraseña incorrectos.')
      return
    }

    toast.success(`Bienvenido, ${user.role}`)

    setTimeout(() => {
      if (user.role === 'alumno') navigate('/alumno/dashboard')
      if (user.role === 'administrativo') navigate('/administrativo/dashboard')
      if (user.role === 'admin') navigate('/admin/dashboard')
    }, 1000)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="bg-white rounded-2xl shadow-md w-full max-w-md px-10 py-12">

          {/* Logo / Título */}
          <div className="mb-10 text-center">
            <img
              src="/traumatic_logo.png"
              alt="Traumatic"
              className="h-64 mx-auto mb-4"
            />
            {/* <h1 className="text-3xl font-bold text-accent">Traumatic</h1>
            <p className="text-sm text-gray-600 mt-1">Sistema de Gestión de Trámites Escolares</p> */}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="ejemplo@uas.edu.mx"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition"
            >
              Iniciar sesión
            </button>
          </form>

        </div>
      </div>
    </>
  )
}