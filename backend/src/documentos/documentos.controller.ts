import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('ALUMNO')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (MIME_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new BadRequestException('Solo se permiten PDF e imágenes (jpg, png, gif, webp)'), false)
      }
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('idTramite') idTramiteStr: string,
    @CurrentUser() user: { id: string },
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    return this.documentosService.subirDocumento(
      file,
      BigInt(idTramiteStr),
      BigInt(user.id),
    )
  }

  @Get('tramite/:idTramite')
  async porTramite(@Param('idTramite') idTramite: string) {
    return this.documentosService.obtenerPorTramite(BigInt(idTramite))
  }

  @Delete(':idDocumento')
  @UseGuards(RolesGuard)
  @Roles('ALUMNO')
  async eliminar(
    @Param('idDocumento') idDocumento: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.documentosService.eliminarDocumento(
      BigInt(idDocumento),
      BigInt(user.id),
    )
  }
}
