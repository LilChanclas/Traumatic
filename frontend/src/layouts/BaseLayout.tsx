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
        <div className="flex flex-col justify-between h-full">

            {/* TOP */}
            <div>

            {/* Logo */}
            <div className="mb-8 px-2">
                <img
                src="/traumatic_chiquito.png"
                alt="Traumatic"
                className="w-42 object-contain opacity-90"
                />
            </div>

            {/* Label */}
            <p className="text-white/30 text-[10px] font-medium tracking-[2px] uppercase px-2 mb-3">
                Principal
            </p>

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
                        `group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                            ? 'bg-white/15 text-white shadow-md ring-1 ring-white/20'
                            : 'text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1'
                        }`
                    }
                    >
                    {({ isActive }) => (
                        <>
                        <Icon
                            size={18}
                            className="opacity-80 transition-transform group-hover:scale-105"
                        />

                        <span className="flex-1">{item.label}</span>

                        {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        )}
                        </>
                    )}
                    </NavLink>
                )
                })}
            </nav>
            </div>

            {/* BOTTOM */}
            <div className="pt-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

            <button
                onClick={handleLogout}
                className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-all duration-200 hover:bg-white/10"
            >
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition">
                <FiLogOut size={16} />
                </div>

                <span className="flex-1">Cerrar sesión</span>

                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition">
                →
                </span>
            </button>
            </div>
        </div>
    )

    return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-60 bg-gradient-to-b from-primary to-primary/90 flex-col py-6 px-4 fixed h-full z-20 shadow-xl">
        {sidebarContent}
        </aside>

        {/* Overlay móvil */}
        {sidebarOpen && (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        />
        )}

        {/* Sidebar móvil */}
        <aside
        className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-primary to-primary/90 flex flex-col py-6 px-4 z-30 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        >
        <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
        >
            <FiX size={20} />
        </button>

        {sidebarContent}
        </aside>

        {/* Contenido principal */}
        <div className="lg:ml-60 flex-1 flex flex-col w-full">

        {/* Navbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">

            <div className="flex items-center gap-3">
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-primary"
            >
                <FiMenu size={22} />
            </button>

            <h1 className="text-lg font-semibold text-gray-800">
                Bienvenido, {user.name}
            </h1>
            </div>

            <ProfileMenu
            name={user.name}
            rol={user.rol}
            iniciales={user.iniciales}
            />
        </header>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6">
            <Outlet />
        </main>

        </div>
    </div>
    )
}