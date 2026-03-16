/**
 * estructura comun para los 3 roles (sidebar, navbar, bolita)
 * recibe como props el título del rol y los items de navegación, y renderiza todo.
 */
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { FiLogOut } from 'react-icons/fi'
import ProfileMenu from '../components/ProfileMenu'
import toast from 'react-hot-toast'

interface NavItem {
    label: string
    path: string
    icon: IconType
}
//Datos que tiene que recibir el baselayout
interface Props {
    navItems: NavItem[]
    user: {
        name: string
        rol: string
        //opcional
        iniciales: string
    }
}

export default function BaseLayout({ navItems, user }: Props) {

    const navigate = useNavigate()

    function handleLogout() {
        toast.success('Sesión cerrada correctamente')
        setTimeout(() => navigate('/'), 1000)
    }

    return (
        <div className="flex min-h-screen bg-surface">

            {/* Sidebar */}
            <aside className="w-64 bg-primary flex flex-col justify-between py-8 px-6 fixed h-full">
                <div>

                    {/* Logo */}
                    <div className="mb-10 text-center bg-white rounded-xl p-6 shadow-md">
                        <img src="/Logo.png" alt="Traumatic" className="h-24 mx-auto mb-3" />
                        <p className="text-black text-sm font-bold tracking-wide">Trámites Escolares</p>
                    </div>

                    {/* Navegación */}
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all font-medium ${isActive
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </NavLink>
                            )
                        })}
                    </nav>
                </div>
                {/* Parte inferior del sidebar */}
                <div className="space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-white/70 hover:text-white text-sm px-4 py-3 rounded-lg hover:bg-white/10 transition"
                    >
                        <FiLogOut size={18} />
                        Cerrar sesión
                    </button>
                </div>

            </aside>

            {/* Contenido principal */}
            <div className="ml-64 flex-1 flex flex-col">

                {/* Navbar superior */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">

                    {/* Bienvenida */}
                    <h1 className="text-lg font-semibold text-text">
                        Bienvenido, {user.name}
                    </h1>

                    {/* Perfil */}
                    <div className="flex items-center gap-3">
                        <ProfileMenu
                            name={user.name}
                            rol={user.rol}
                            //opcional
                            iniciales={user.iniciales}
                        />
                    </div>

                </header>

                {/* Página actual */}
                <main className="flex-1 p-10">
                    <Outlet />
                </main>

            </div>

        </div>
    )
}