import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const ESTADO_LABEL: Record<string, string> = {
  ENVIADO:     'Enviado',
  EN_REVISION: 'En revisión',
  APROBADO:    'Aprobado',
  RECHAZADO:   'Rechazado',
  ENTREGADO:   'Entregado',
}

const ESTADO_COLOR: Record<string, string> = {
  ENVIADO:     '#3b82f6',
  EN_REVISION: '#f59e0b',
  APROBADO:    '#22c55e',
  RECHAZADO:   '#ef4444',
  ENTREGADO:   '#6b7280',
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly apiKey: string
  private readonly senderEmail: string
  private readonly senderName: string

  constructor(private readonly config: ConfigService) {
    this.apiKey      = this.config.get<string>('BREVO_API_KEY') ?? ''
    this.senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL') ?? ''
    this.senderName  = this.config.get<string>('BREVO_SENDER_NAME') ?? 'Traumatic'
  }

  private async send(to: string, toName: string, subject: string, html: string) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key':      this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender:      { name: this.senderName, email: this.senderEmail },
          to:          [{ email: to, name: toName }],
          subject,
          htmlContent: html,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        this.logger.error(`Brevo error ${res.status}: ${body}`)
      }
    } catch (err) {
      this.logger.error('Error al enviar correo', err)
    }
  }

  async enviarConfirmacionTramite(opts: {
    correo:    string
    nombre:    string
    folio:     string
    tipoNombre: string
    fecha:     string
  }) {
    const { correo, nombre, folio, tipoNombre, fecha } = opts
    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:#1e3a5f;padding:28px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">Traumatic</h1>
          <p style="margin:4px 0 0;color:#a8c4e0;font-size:13px">Sistema de Trámites Escolares</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 8px;color:#374151;font-size:15px">Hola, <strong>${nombre}</strong></p>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
            Tu solicitud de trámite fue recibida exitosamente. A continuación encontrarás los detalles:
          </p>

          <!-- Detalle -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:24px">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Folio</span>
                <p style="margin:4px 0 0;color:#111827;font-size:18px;font-weight:700">${folio}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Tipo de trámite</span>
                <p style="margin:4px 0 0;color:#111827;font-size:14px;font-weight:600">${tipoNombre}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Fecha de solicitud</span>
                <p style="margin:4px 0 0;color:#111827;font-size:14px">${fecha}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Estado actual</span>
                <p style="margin:6px 0 0">
                  <span style="display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px">Enviado</span>
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6">
            Puedes consultar el estado de tu trámite en cualquier momento desde el sistema. Te notificaremos por correo cuando haya cambios.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Traumatic · Sistema de Trámites Escolares</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    await this.send(correo, nombre, `Tu trámite fue recibido — Folio ${folio}`, html)
  }

  async enviarCambioEstado(opts: {
    correo:     string
    nombre:     string
    folio:      string
    tipoNombre: string
    nuevoEstado: string
    comentario?: string
  }) {
    const { correo, nombre, folio, tipoNombre, nuevoEstado, comentario } = opts
    const estadoLabel = ESTADO_LABEL[nuevoEstado] ?? nuevoEstado
    const estadoColor = ESTADO_COLOR[nuevoEstado] ?? '#6b7280'
    const esBg       = nuevoEstado === 'RECHAZADO' ? '#fef2f2' : '#f0fdf4'

    const comentarioHtml = comentario ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${esBg};border-radius:10px;border-left:4px solid ${estadoColor};margin-top:20px">
            <tr><td style="padding:14px 18px">
              <p style="margin:0 0 4px;color:#374151;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px">
                ${nuevoEstado === 'RECHAZADO' ? 'Motivo del rechazo' : 'Comentario del administrativo'}
              </p>
              <p style="margin:0;color:#374151;font-size:14px;line-height:1.6">${comentario}</p>
            </td></tr>
          </table>` : ''

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:#1e3a5f;padding:28px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">Traumatic</h1>
          <p style="margin:4px 0 0;color:#a8c4e0;font-size:13px">Sistema de Trámites Escolares</p>
        </td></tr>

        <!-- Estado banner -->
        <tr><td style="background:${estadoColor};padding:14px 40px;text-align:center">
          <p style="margin:0;color:#fff;font-size:15px;font-weight:600">Estado actualizado: ${estadoLabel}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <p style="margin:0 0 8px;color:#374151;font-size:15px">Hola, <strong>${nombre}</strong></p>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6">
            El estado de tu trámite ha sido actualizado. A continuación encontrarás los detalles:
          </p>

          <!-- Detalle -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:4px">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Folio</span>
                <p style="margin:4px 0 0;color:#111827;font-size:18px;font-weight:700">${folio}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e5e7eb">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Tipo de trámite</span>
                <p style="margin:4px 0 0;color:#111827;font-size:14px;font-weight:600">${tipoNombre}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px">
                <span style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:.5px">Nuevo estado</span>
                <p style="margin:6px 0 0">
                  <span style="display:inline-block;background:${estadoColor}22;color:${estadoColor};font-size:12px;font-weight:700;padding:4px 14px;border-radius:999px;border:1px solid ${estadoColor}44">${estadoLabel}</span>
                </p>
              </td>
            </tr>
          </table>

          ${comentarioHtml}

          <p style="margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6">
            Puedes consultar el historial completo de tu trámite en el sistema.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">Este es un correo automático, por favor no respondas a este mensaje.</p>
          <p style="margin:4px 0 0;color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Traumatic · Sistema de Trámites Escolares</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    await this.send(correo, nombre, `Tu trámite ${folio} fue actualizado — ${estadoLabel}`, html)
  }
}
