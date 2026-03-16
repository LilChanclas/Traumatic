/**
 * estructura comun para los 3 roles (sidebar, navbar, bolita)
 * recibe como props el título del rol y los items de navegación, y renderiza todo.
 */
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import ProfileMenu from '../components/ProfileMenu'
import toast from 'react-hot-toast'

interface NavItem {
    label: string
    path: string
    icon: IconType
}
// datos que tiene que recibir el base layout
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
    const [sidebarOpen, setSidebarOpen] = useState(false)

    function handleLogout() {
        toast.success('Sesión cerrada correctamente')
        setTimeout(() => navigate('/'), 1000)
    }

    const sidebarContent = (
        <>
            {/* Logo */}
            <div>
                <div className="mb-10 text-center bg-white rounded-xl p-4 shadow-md">
                    <img src="/Logo.png" alt="Traumatic" className="h-20 mx-auto mb-2" />
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
                                onClick={() => setSidebarOpen(false)}
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

            {/* Parte inferior */}
            <div className="space-y-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-white/70 hover:text-white text-sm px-4 py-3 rounded-lg hover:bg-white/10 transition"
                >
                    <FiLogOut size={18} />
                    Cerrar sesión
                </button>
            </div>
        </>
    )

    return (
        <div className="flex min-h-screen bg-surface">

            {/* Sidebar desktop */}
            <aside className="hidden lg:flex w-64 bg-primary flex-col justify-between py-8 px-6 fixed h-full z-20">
                {sidebarContent}
            </aside>

            {/* Overlay móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar móvil */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-primary flex flex-col justify-between py-8 px-6 z-30 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Botón cerrar */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                >
                    <FiX size={20} />
                </button>
                {sidebarContent}
            </aside>

            {/* Contenido principal */}
            <div className="lg:ml-64 flex-1 flex flex-col w-full">

                {/* Navbar superior */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
                    {/* Bienvenida */}
                    <h1 className="text-xl font-semibold text-primary">
                        Bienvenido, {user.name}
                    </h1>

                    {/* Botón hamburguesa — solo móvil */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-primary hover:text-primary-hover transition"
                    >
                        <FiMenu size={22} />
                    </button>

                    {/* Spacer desktop */}
                    <div className="hidden lg:block" />

                    {/* Perfil */}
                    <div className="flex items-center gap-3">
                        <ProfileMenu
                            name={user.name}
                            rol={user.rol}
                            iniciales={user.iniciales}
                        />
                    </div>
                </header>

                {/* Página actual */}
                <main className="flex-1 p-4 lg:p-10">
                    <Outlet />
                </main>

            </div>

        </div>
    )
}