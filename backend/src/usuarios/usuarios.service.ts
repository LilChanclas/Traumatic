import { Injectable } from '@nestjs/common'
import { UsuariosRepository } from './usuarios.repository'
import { Provider, Rol } from 'generated/prisma/enums'

@Injectable()
export class UsuariosService {
  constructor(private repo: UsuariosRepository) {}

  findById(id: bigint) {
    return this.repo.findById(id)
  }

  findByCorreo(correo: string) {
    return this.repo.findByCorreo(correo)
  }

  findAll(filters?: { rol?: string; activo?: boolean; pendienteAprobacion?: boolean }) {
    return this.repo.findAll(filters)
  }

  create(data: {
    nombre: string
    apellidos: string
    correo: string
    provider: Provider
    providerId: string
    fotoUrl?: string
  }) {
    return this.repo.create(data)
  }

  createWithRole(data: {
    nombre: string
    apellidos: string
    correo: string
    provider?: Provider | null
    providerId?: string | null
    fotoUrl?: string | null
    rol: Rol
    activo: boolean
    pendienteAprobacion: boolean
  }) {
    return this.repo.createWithRole(data)
  }

  updateProviderData(id: bigint, providerId: string, fotoUrl?: string) {
    return this.repo.updateProviderData(id, providerId, fotoUrl)
  }

  updateUser(
    id: bigint,
    data: { nombre?: string; apellidos?: string; rol?: Rol; activo?: boolean },
  ) {
    return this.repo.updateUser(id, data)
  }

  aprobar(id: bigint) {
    return this.repo.aprobar(id)
  }

  desactivar(id: bigint) {
    return this.repo.desactivar(id)
  }
}
