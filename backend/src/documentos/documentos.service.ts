import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import * as streamifier from 'streamifier';

@Injectable()
export class DocumentosService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary,
    private readonly prisma: PrismaService,
  ) {}

  private uploadStream(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinaryClient.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(upload);
    });
  }

  async subirDocumento(
    file: Express.Multer.File,
    idTramite: bigint,
    idUsuario: bigint,
  ) {
    const tramite = await this.prisma.tramite.findUnique({
      where: { idTramite },
    });
    if (!tramite) throw new NotFoundException('Trámite no encontrado');

    const result = await this.uploadStream(file.buffer, `tramites/${idTramite}`);

    const documento = await this.prisma.documento.create({
      data: {
        idTramite,
        idUsuarioSubio: idUsuario,
        nombreArchivo: file.originalname,
        rutaAlmacenamiento: result.secure_url,
        tipoMime: file.mimetype,
        tamanioBytes: file.size,
      },
    });

    return documento;
  }

  async obtenerPorTramite(idTramite: bigint) {
    return this.prisma.documento.findMany({
      where: { idTramite },
      orderBy: { createdAt: 'asc' },
    });
  }

  async eliminarDocumento(idDocumento: bigint, idUsuario: bigint) {
    const doc = await this.prisma.documento.findUnique({
      where: { idDocumento },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (doc.idUsuarioSubio !== idUsuario)
      throw new ForbiddenException('No puedes eliminar este documento');

    // Extract public_id from the Cloudinary URL
    const urlParts = doc.rutaAlmacenamiento.split('/');
    const folderAndFile = urlParts.slice(-3).join('/'); // folder/subfolder/filename
    const publicId = folderAndFile.replace(/\.[^/.]+$/, ''); // strip extension

    await this.cloudinaryClient.uploader.destroy(publicId, {
      resource_type: 'raw',
    });

    return this.prisma.documento.delete({ where: { idDocumento } });
  }
}
