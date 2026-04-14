import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  FiPlus, FiCheck, FiX, FiEdit2, FiSearch, FiUserCheck, FiUserX, FiClock, FiUsers,
} from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Usuario {
  id: string
  nombre: string
  apellidos: string
  correo: string
  rol: 'ALUMNO' | 'ADMINISTRATIVO' | 'ADMIN'
  activo: boolean
  pendienteAprobacion: boolean
  fotoUrl?: string | null
  createdAt: string
}

type ModalMode = 'create' | 'edit' | null

const ROL_LABEL: Record<string, string> = {
  ALUMNO: 'Alumno',
  ADMINISTRATIVO: 'Administrativo',
  ADMIN: 'Administrador',
}

const ROL_COLORS: Record<string, string> = {
  ALUMNO: 'bg-blue-100 text-blue-700',
  ADMINISTRATIVO: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
}

function EstadoBadge({ usuario }: { usuario: Usuario }) {
  if (usuario.pendienteAprobacion)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><FiClock size={10} />Pendiente</span>
  if (usuario.activo)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><FiUserCheck size={10} />Activo</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><FiUserX size={10} />Inactivo</span>
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', apellidos: '', correo: '', rol: 'ALUMNO' as Usuario['rol'] })
  const [saving, setSaving] = useState(false)

  async function fetchUsuarios() {
    setLoading(true)
    try {
      const res = await apiFetch('/admin/usuarios')
      if (!res.ok) throw new Error()
      setUsuarios(await res.json())
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsuarios() }, [])

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filtered = usuarios.filter((u) => {
    const matchSearch =
      !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(search.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.toLowerCase())

    const matchRol = !filterRol || u.rol === filterRol

    const matchEstado =
      !filterEstado ||
      (filterEstado === 'activo' && u.activo && !u.pendienteAprobacion) ||
      (filterEstado === 'inactivo' && !u.activo && !u.pendienteAprobacion) ||
      (filterEstado === 'pendiente' && u.pendienteAprobacion)

    return matchSearch && matchRol && matchEstado
  })

  // ── Acciones ───────────────────────────────────────────────────────────────
  async function handleAprobar(id: string) {
    try {
      const res = await apiFetch(`/admin/usuarios/${id}/aprobar`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast.success('Administrativo aprobado')
      fetchUsuarios()
    } catch { toast.error('Error al aprobar') }
  }

  async function handleDesactivar(id: string) {
    if (!confirm('¿Desactivar esta cuenta?')) return
    try {
      const res = await apiFetch(`/admin/usuarios/${id}/desactivar`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast.success('Cuenta desactivada')
      fetchUsuarios()
    } catch { toast.error('Error al desactivar') }
  }

  async function handleActivar(id: string) {
    try {
      const res = await apiFetch(`/admin/usuarios/${id}/activar`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast.success('Cuenta activada')
      fetchUsuarios()
    } catch { toast.error('Error al activar') }
  }

  // ── Modal create / edit ────────────────────────────────────────────────────
  function openCreate() {
    setForm({ nombre: '', apellidos: '', correo: '', rol: 'ALUMNO' })
    setEditTarget(null)
    setModalMode('create')
  }

  function openEdit(u: Usuario) {
    setForm({ nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, rol: u.rol })
    setEditTarget(u)
    setModalMode('edit')
  }

  async function handleSave() {
    if (!form.nombre || !form.apellidos || !form.correo) {
      toast.error('Completa todos los campos')
      return
    }
    setSaving(true)
    try {
      let res: Response
      if (modalMode === 'create') {
        res = await apiFetch('/admin/usuarios', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      } else {
        res = await apiFetch(`/admin/usuarios/${editTarget!.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ nombre: form.nombre, apellidos: form.apellidos, rol: form.rol }),
        })
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error')
      }
      toast.success(modalMode === 'create' ? 'Usuario creado' : 'Usuario actualizado')
      setModalMode(null)
      fetchUsuarios()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Stats rápidas ──────────────────────────────────────────────────────────
  const pendientesCount = usuarios.filter(u => u.pendienteAprobacion).length

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Administra alumnos, administrativos y admins</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition"
        >
          <FiPlus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Alerta de pendientes */}
      {pendientesCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <FiClock className="text-amber-500 shrink-0" size={18} />
          <span>
            <strong>{pendientesCount}</strong> administrativo{pendientesCount !== 1 ? 's' : ''} pendiente{pendientesCount !== 1 ? 's' : ''} de aprobación
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: usuarios.length, icon: FiUsers, cls: 'text-blue-600 bg-blue-50' },
          { label: 'Alumnos', value: usuarios.filter(u => u.rol === 'ALUMNO').length, icon: FiUserCheck, cls: 'text-green-600 bg-green-50' },
          { label: 'Administrativos', value: usuarios.filter(u => u.rol === 'ADMINISTRATIVO').length, icon: FiUserCheck, cls: 'text-purple-600 bg-purple-50' },
          { label: 'Pendientes', value: pendientesCount, icon: FiClock, cls: 'text-amber-600 bg-amber-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.cls}`}><Icon size={16} /></div>
              <div>
                <p className="text-lg font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
          <FiSearch size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={filterRol}
          onChange={e => setFilterRol(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        >
          <option value="">Todos los roles</option>
          <option value="ALUMNO">Alumno</option>
          <option value="ADMINISTRATIVO">Administrativo</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No se encontraron usuarios</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Registro</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.fotoUrl ? (
                        <img src={u.fotoUrl} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {u.nombre[0]}{u.apellidos[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{u.nombre} {u.apellidos}</p>
                        <p className="text-xs text-gray-400">{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROL_COLORS[u.rol]}`}>
                      {ROL_LABEL[u.rol]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge usuario={u} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Aprobar si está pendiente */}
                      {u.pendienteAprobacion && (
                        <button
                          onClick={() => handleAprobar(u.id)}
                          title="Aprobar"
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                        >
                          <FiCheck size={15} />
                        </button>
                      )}
                      {/* Editar */}
                      <button
                        onClick={() => openEdit(u)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      {/* Activar / Desactivar */}
                      {u.activo && !u.pendienteAprobacion ? (
                        <button
                          onClick={() => handleDesactivar(u.id)}
                          title="Desactivar"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        >
                          <FiX size={15} />
                        </button>
                      ) : !u.pendienteAprobacion ? (
                        <button
                          onClick={() => handleActivar(u.id)}
                          title="Activar"
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition"
                        >
                          <FiUserCheck size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5">
              {modalMode === 'create' ? 'Crear usuario' : 'Editar usuario'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos *</label>
                  <input
                    value={form.apellidos}
                    onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Apellidos"
                  />
                </div>
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico *</label>
                  <input
                    value={form.correo}
                    onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                    type="email"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="correo@uas.edu.mx"
                  />
                  <p className="text-xs text-gray-400 mt-1">El usuario iniciará sesión con Google o Microsoft usando este correo</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select
                  value={form.rol}
                  onChange={e => setForm(f => ({ ...f, rol: e.target.value as Usuario['rol'] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="ALUMNO">Alumno</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : (modalMode === 'create' ? 'Crear usuario' : 'Guardar cambios')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
