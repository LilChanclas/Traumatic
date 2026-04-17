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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentosService } from './documentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('idTramite') idTramiteStr: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.documentosService.subirDocumento(
      file,
      BigInt(idTramiteStr),
      BigInt(user.id),
    );
  }

  @Get('tramite/:idTramite')
  async porTramite(@Param('idTramite') idTramite: string) {
    return this.documentosService.obtenerPorTramite(BigInt(idTramite));
  }

  @Delete(':idDocumento')
  async eliminar(
    @Param('idDocumento') idDocumento: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.documentosService.eliminarDocumento(
      BigInt(idDocumento),
      BigInt(user.id),
    );
  }
}
