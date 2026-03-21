import { Injectable } from '@nestjs/common'
import { UsuariosRepository } from './usuarios.repository'

@Injectable()
export class UsuariosService {
  constructor(private repo: UsuariosRepository) {}

  findById(id: bigint) {
    return this.repo.findById(id)
  }

  findByCorreo(correo: string) {
    return this.repo.findByCorreo(correo)
  }

  create(data: any) {
    return this.repo.create(data)
  }

  updateProviderData(id: bigint, providerId: string, fotoUrl?: string) {
    return this.repo.updateProviderData(id, providerId, fotoUrl)
  }
}