<?php
/**
 * send_mail.php — Alimentos Mary
 * Recibe el formulario de contacto y envía el correo a info@alimentosmary.com
 *
 * Ubicación: raíz del sitio web (mismo nivel que index.html) */
 
// ── Cabeceras de seguridad ──
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
 
// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'Método no permitido.']);
    exit;
}
 
// ── Función de sanitización ──
function clean(string $str): string {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}
 
// ── Leer y sanitizar campos ──
$nombre  = clean($_POST['nombre']  ?? '');
$email   = clean($_POST['email']   ?? '');
$asunto  = clean($_POST['asunto']  ?? '');
$mensaje = clean($_POST['mensaje'] ?? '');
 
// ── Validaciones en servidor (segunda capa de seguridad) ──
$errores = [];
 
// Nombre: solo letras, tildes, espacios, guiones y apóstrofes
if (empty($nombre)) {
    $errores[] = 'El nombre es obligatorio.';
} elseif (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ\s\'\-]{2,80}$/u', $nombre)) {
    $errores[] = 'El nombre contiene caracteres no permitidos.';
}
 
// Email
if (empty($email)) {
    $errores[] = 'El correo es obligatorio.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'El correo electrónico no es válido.';
} elseif (strlen($email) > 120) {
    $errores[] = 'El correo es demasiado largo.';
}
 
// Asunto
if (empty($asunto)) {
    $errores[] = 'El asunto es obligatorio.';
} elseif (strlen($asunto) < 4) {
    $errores[] = 'El asunto es demasiado corto.';
} elseif (strlen($asunto) > 100) {
    $errores[] = 'El asunto supera el máximo permitido.';
}
 
// Mensaje
if (empty($mensaje)) {
    $errores[] = 'El mensaje es obligatorio.';
} elseif (strlen($mensaje) < 10) {
    $errores[] = 'El mensaje es demasiado corto.';
} elseif (strlen($mensaje) > 1200) {
    $errores[] = 'El mensaje supera el máximo permitido.';
}
 
// Anti-spam básico: detectar URLs en masa (más de 2 URLs = posible spam)
$urlCount = preg_match_all('/https?:\/\//i', $mensaje);
if ($urlCount > 2) {
    $errores[] = 'El mensaje contiene demasiados enlaces.';
}
 
if (!empty($errores)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'msg' => implode(' ', $errores)]);
    exit;
}
 
// ── Configuración del correo ──
$destinatario = 'jrangel@alimentosmary.com';
$asuntoEmail  = '[Web] Contacto: ' . $asunto;
$fecha        = date('d/m/Y H:i');
$ip           = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
 
// ── Cuerpo del correo en HTML ──
$cuerpoHTML = '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)">
          <!-- Header rojo -->
          <tr>
            <td style="background:#E1251B;padding:28px 36px">
              <p style="margin:0;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700">Alimentos Mary — Formulario de Contacto</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:900">Nuevo mensaje desde la web</h1>
            </td>
          </tr>
          <!-- Datos del remitente -->
          <tr>
            <td style="padding:32px 36px 0">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-bottom:20px;vertical-align:top">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E1251B">Nombre</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:600">' . $nombre . '</p>
                  </td>
                  <td width="50%" style="padding-bottom:20px;vertical-align:top">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E1251B">Correo Electrónico</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a">
                      <a href="mailto:' . $email . '" style="color:#E1251B;text-decoration:none">' . $email . '</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-bottom:20px">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E1251B">Asunto</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:600">' . $asunto . '</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Mensaje -->
          <tr>
            <td style="padding:0 36px 32px">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E1251B">Mensaje</p>
              <div style="background:#f8f8f8;border-left:3px solid #E1251B;padding:16px 20px;border-radius:0 4px 4px 0;font-size:15px;line-height:1.7;color:#444;white-space:pre-wrap">' . nl2br($mensaje) . '</div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #eee">
              <p style="margin:0;font-size:11px;color:#aaa">
                Fecha: ' . $fecha . ' &nbsp;|&nbsp; IP: ' . $ip . '<br>
                Este mensaje fue enviado desde el formulario de contacto de <strong style="color:#E1251B">alimentosmary.com</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';
 
// ── Cuerpo alternativo en texto plano ──
$cuerpoTexto = "Nuevo mensaje desde el formulario de contacto de alimentosmary.com\n"
    . str_repeat('=', 60) . "\n"
    . "Nombre:  $nombre\n"
    . "Email:   $email\n"
    . "Asunto:  $asunto\n"
    . str_repeat('-', 60) . "\n"
    . "Mensaje:\n$mensaje\n"
    . str_repeat('-', 60) . "\n"
    . "Fecha: $fecha | IP: $ip\n";
 
// ── Cabeceras del correo (multipart/alternative) ──
$boundary = md5(uniqid(rand(), true));
 
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
$headers .= "From: \"Web Alimentos Mary\" <no-reply@alimentosmary.com>\r\n";
$headers .= "Reply-To: $nombre <$email>\r\n";
$headers .= "X-Mailer: AlimentosMaryWebForm/1.0\r\n";
 
$body  = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $cuerpoTexto . "\r\n";
$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $cuerpoHTML . "\r\n";
$body .= "--$boundary--";
 
// ── Enviar ──
$enviado = mail($destinatario, $asuntoEmail, $body, $headers);
 
if ($enviado) {
    // También enviar copia de confirmación al remitente
    $asuntoConfirm = 'Recibimos tu mensaje — Alimentos Mary';
    $confirmHTML = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden">
          <tr>
            <td style="background:#E1251B;padding:28px 36px">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900">¡Gracias por contactarnos!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px">
              <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Hola <strong>' . $nombre . '</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Hemos recibido tu mensaje con el asunto: <strong>"' . $asunto . '"</strong>.</p>
              <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7">Nuestro equipo lo revisará y te responderá a la brevedad posible en el horario de atención:<br><strong>Lunes a Viernes: 8:00 AM – 5:00 PM</strong>.</p>
              <p style="margin:0;font-size:15px;color:#444;line-height:1.7">Atentamente,<br><strong style="color:#E1251B">Equipo Alimentos Mary</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f5f0;padding:18px 36px;border-top:1px solid #eee">
              <p style="margin:0;font-size:11px;color:#aaa">Este es un correo automático. Por favor no respondas a este mensaje.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>';
 
    $headersConfirm  = "MIME-Version: 1.0\r\n";
    $headersConfirm .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headersConfirm .= "From: \"Alimentos Mary\" <no-reply@alimentosmary.com>\r\n";
 
    // Intentar enviar confirmación (no crítico si falla)
    @mail($email, $asuntoConfirm, $confirmHTML, $headersConfirm);
 
    echo json_encode(['ok' => true, 'msg' => 'Mensaje enviado correctamente.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'No se pudo enviar el correo. Por favor intenta más tarde.']);
}