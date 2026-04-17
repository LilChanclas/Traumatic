import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiFileText } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface TipoTramite {
  idTipo: string
  nombre: string
  descripcion: string | null
  docsRequeridos: string[]
  activo: boolean
  createdAt: string
}

type ModalMode = 'create' | 'edit' | null

const emptyForm = { nombre: '', descripcion: '', docsRequeridos: [] as string[] }

export default function TiposTramitePage() {
  const [tipos, setTipos] = useState<TipoTramite[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActivo, setFilterActivo] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<TipoTramite | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [newDoc, setNewDoc] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchTipos() {
    setLoading(true)
    try {
      const res = await apiFetch('/admin/tipos-tramite')
      if (!res.ok) throw new Error()
      setTipos(await res.json())
    } catch {
      toast.error('Error al cargar tipos de trámite')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTipos() }, [])

  const filtered = tipos.filter(t => {
    const matchSearch = !search || t.nombre.toLowerCase().includes(search.toLowerCase())
    const matchActivo =
      !filterActivo ||
      (filterActivo === 'activo' && t.activo) ||
      (filterActivo === 'inactivo' && !t.activo)
    return matchSearch && matchActivo
  })

  function openCreate() {
    setForm(emptyForm)
    setNewDoc('')
    setEditTarget(null)
    setModalMode('create')
  }

  function openEdit(t: TipoTramite) {
    setForm({ nombre: t.nombre, descripcion: t.descripcion ?? '', docsRequeridos: [...t.docsRequeridos] })
    setNewDoc('')
    setEditTarget(t)
    setModalMode('edit')
  }

  function addDoc() {
    const trimmed = newDoc.trim()
    if (!trimmed) return
    if (form.docsRequeridos.includes(trimmed)) {
      toast.error('Ya existe ese documento')
      return
    }
    setForm(f => ({ ...f, docsRequeridos: [...f.docsRequeridos, trimmed] }))
    setNewDoc('')
  }

  function removeDoc(doc: string) {
    setForm(f => ({ ...f, docsRequeridos: f.docsRequeridos.filter(d => d !== doc) }))
  }

  async function handleSave() {
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    setSaving(true)
    try {
      const body = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || undefined,
        docsRequeridos: form.docsRequeridos,
      }
      let res: Response
      if (modalMode === 'create') {
        res = await apiFetch('/admin/tipos-tramite', { method: 'POST', body: JSON.stringify(body) })
      } else {
        res = await apiFetch(`/admin/tipos-tramite/${editTarget!.idTipo}`, { method: 'PATCH', body: JSON.stringify(body) })
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error')
      }
      toast.success(modalMode === 'create' ? 'Tipo de trámite creado' : 'Tipo de trámite actualizado')
      setModalMode(null)
      fetchTipos()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(t: TipoTramite) {
    const accion = t.activo ? 'desactivar' : 'activar'
    try {
      const res = await apiFetch(`/admin/tipos-tramite/${t.idTipo}/${accion}`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      toast.success(t.activo ? 'Tipo desactivado' : 'Tipo activado')
      fetchTipos()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const activosCount = tipos.filter(t => t.activo).length

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tipos de Trámite</h2>
          <p className="text-sm text-gray-500 mt-1">Configura los trámites disponibles para los alumnos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition"
        >
          <FiPlus size={16} /> Nuevo tipo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total', value: tipos.length, cls: 'text-blue-600 bg-blue-50' },
          { label: 'Activos', value: activosCount, cls: 'text-green-600 bg-green-50' },
          { label: 'Inactivos', value: tipos.length - activosCount, cls: 'text-gray-500 bg-gray-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.cls}`}><FiFileText size={16} /></div>
            <div>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
          <FiSearch size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        <select
          value={filterActivo}
          onChange={e => setFilterActivo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
        >
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando tipos de trámite...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No se encontraron tipos de trámite</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Documentos requeridos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Creado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.idTipo} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{t.nombre}</p>
                    {t.descripcion && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {t.docsRequeridos.length === 0 ? (
                      <span className="text-xs text-gray-400">Ninguno</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {t.docsRequeridos.slice(0, 3).map(d => (
                          <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{d}</span>
                        ))}
                        {t.docsRequeridos.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{t.docsRequeridos.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.activo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Activo</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {new Date(t.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        title="Editar"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        title={t.activo ? 'Desactivar' : 'Activar'}
                        className={`p-1.5 rounded-lg transition ${t.activo ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {t.activo ? <FiToggleRight size={17} /> : <FiToggleLeft size={17} />}
                      </button>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5">
              {modalMode === 'create' ? 'Crear tipo de trámite' : 'Editar tipo de trámite'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Ej. Constancia de estudios"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Descripción breve del trámite (opcional)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Documentos requeridos</label>

                {/* Lista de docs */}
                {form.docsRequeridos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.docsRequeridos.map(d => (
                      <span
                        key={d}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                      >
                        {d}
                        <button
                          onClick={() => removeDoc(d)}
                          className="text-blue-400 hover:text-blue-600 ml-0.5"
                        >
                          <FiTrash2 size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Agregar doc */}
                <div className="flex gap-2">
                  <input
                    value={newDoc}
                    onChange={e => setNewDoc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Ej. Comprobante de pago"
                  />
                  <button
                    type="button"
                    onClick={addDoc}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition text-sm"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Presiona Enter o el botón para agregar cada documento</p>
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
                {saving ? 'Guardando...' : (modalMode === 'create' ? 'Crear tipo' : 'Guardar cambios')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
