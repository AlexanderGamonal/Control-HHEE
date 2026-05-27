import type { Config } from './types';

export const HORA_NOCHE          = 19 * 60;
export const HORA_SIN_REFRIGERIO = 13 * 60; // entrada > 13:00 → sin descuento refrigerio
export const JORNADA_MIN         = 8 * 60;
export const REFRIGERIO_MIN      = 45;
export const RMV            = 1025;

export const DEFAULT_CONFIG: Config = {
  sueldo: 0,
  url: '',
  fontSize: 'normal',
  jornadaSemanal: 48,
  aplicaAF: false,
  valorAF: RMV * 0.1,
};

export const FERIADOS_FIJOS: Record<string, string> = {
  '01-01': 'Año Nuevo',
  '05-01': 'Día del Trabajo',
  '06-29': 'San Pedro y San Pablo',
  '07-23': 'Día de la Fuerza Aérea del Perú',
  '07-28': 'Fiestas Patrias',
  '07-29': 'Fiestas Patrias',
  '08-30': 'Santa Rosa de Lima',
  '10-08': 'Combate de Angamos',
  '11-01': 'Todos los Santos',
  '12-08': 'Inmaculada Concepción',
  '12-09': 'Batalla de Ayacucho',
  '12-25': 'Navidad',
};

export const APPS_SCRIPT = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("HHEE") || ss.insertSheet("HHEE");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Período","Fecha","Entrada","Salida","Turno","Fin Jornada","Horas Ef.","Delta ±8h","Tipo","Motivo","Actualizado"]);
      sheet.getRange(1,1,1,11).setFontWeight("bold").setBackground("#1c2030").setFontColor("#4d9de8");
    }
    var payload = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
    payload.rows.forEach(function(r) {
      sheet.appendRow([r.periodo, r.fecha, r.entrada, r.salida, r.turno, r.finJornada, r.horasEf, r.delta, r.tipo, r.motivo, new Date().toLocaleString("es-PE")]);
    });
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() {
  return ContentService.createTextOutput("HHEE Script activo ✓");
}`;
