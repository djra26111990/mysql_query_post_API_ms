// Se importan librerias
const mysql = require('mysql');
const axios = require('axios');

// Se establece conexión con la BD (Ambiente de pruebas)
const conBD = mysql.createConnection({
  host: "desarrollo.estratega.ec",
  user: "root",
  password: "desarrollo",
  database: "labasime_Asimed"
});

// Se realiza la consulta a la BD y con los datos obtenidos se va llenando el objeto JSON que será enviado a la API
conBD.connect(
  (err) => {
    //! Se guarda la consulta en una variable
  const consulta = "SELECT concat_ws(' ', pacientes.nombre, pacientes.apellidos) as razon_social_paciente, test_completo.orden_trabajo as secuencial, DATE_FORMAT(test_completo.fecha, '%Y-%m-%d%T') as fecha_emision, adm_empresa.nombre AS razon_social, test_completo.valor_total as total, pacientes.mail as email, pacientes.cedula as identificacion, pacientes.ruc as ruc, pacientes.direccion1 as direccion_paciente, pacientes.telefono1 as telefono, pacientes.celular1 as celular  FROM `test_completo` inner join pacientes on test_completo.id_paciente = pacientes.id inner join adm_empresa on test_completo.id_empresa = adm_empresa.id where DATE(test_completo.fecha) = CURDATE()"

  if (err) throw err;
  conBD.query(consulta, 
   (err, result) => {
    if (err) throw err;
    for (let value of result) {
      obj = {};
      obj.ambiente = 1;
      obj.tipo_emision = 1;

      objResult = {};
      objResult.secuencial = value.secuencial
      objResult.fecha_emision = value.fecha_emision;

      obj2 = {}
      obj2.emisor = {};
      
// if statement para determinar el RUC seún el nombre del laboratorio y guardarlo en la propiedad RUC del obj2
      if (value.razon_social === "Asimed Lab. Kennedy") {
        obj2.emisor.ruc = "0902893379001";
       } else if (value.razon_social === "Asimed Lab. Sur") {
         obj2.emisor.ruc = "0902893379001";
       } else if (value.razon_social === "Asimed Lab. Centro") {
         obj2.emisor.ruc = "0904176310001"
       } else if (value.razon_social === "Asimed Lab. Medical") {
         obj2.emisor.ruc = "0904176310001"
       } else if (value.razon_social === "Asimed Lab. Milagro") {
         obj2.emisor.ruc = "0902893379001";
       }; 

      obj2.emisor.obligado_contabilidad = false;

     
      obj2.emisor.nombre_comercial = "Asimed Lab";

 // If statement para determinar según Laboratorio que valor de razón social se guardará en la propiedad del obj2
     if (value.razon_social === "Asimed Lab. Kennedy") {
      obj2.emisor.razon_social = "VITERI CARRILLO CARLOS ALBERTO";
     } else if (value.razon_social === "Asimed Lab. Sur") {
       obj2.emisor.razon_social = "VITERI CARRILLO CARLOS ALBERTO";
     } else if (value.razon_social === "Asimed Lab. Centro") {
       obj2.emisor.razon_social = "RAMIREZ ROSERO MARIA ISABEL"
     } else if (value.razon_social === "Asimed Lab. Medical") {
       obj2.emisor.razon_social = "RAMIREZ ROSERO MARIA ISABEL"
     } else if (value.razon_social === "Asimed Lab. Milagro") {
       obj2.emisor.razon_social = "VITERI CARRILLO CARLOS ALBERTO";
     }; 

     
    obj2.emisor.direccion = "Kennedy Norte Av. Miguel Alcivar Mz 408 SI 2";
     

     obj2.emisor.establecimiento = {}
     obj2.emisor.establecimiento.punto_emision = "002"
/*
  // If statement para determinar según Laboratorio que valor de punto de establecimiento se guardará en la propiedad del obj2
  if (value.razon_social === "Asimed Lab. Kennedy") {
      obj2.emisor.establecimiento.punto_emision = "005";
  } else if (value.razon_social === "Asimed Lab. Sur") {
      obj2.emisor.establecimiento.punto_emision = "002";
  } else if (value.razon_social === "Asimed Lab. Centro") {
      obj2.emisor.establecimiento.punto_emision = "001"
  } else if (value.razon_social === "Asimed Lab. Medical") {
      obj2.emisor.establecimiento.punto_emision = "002"
  } else if (value.razon_social === "Asimed Lab. Milagro") {
      obj2.emisor.establecimiento.punto_emision = "006";
  }; */

  obj2.emisor.establecimiento.codigo = "001";
  
  // If statement para determinar según Laboratorio que valor de dirección se guardará en la propiedad direccion dentro del objeto anidado establecimiento
  if (value.razon_social === "Asimed Lab. Kennedy") {
     obj2.emisor.establecimiento.direccion = "Kennedy Norte Av. Miguel Alcivar Mz 408 SI 2";
   } else if (value.razon_social === "Asimed Lab. Sur") {
     obj2.emisor.establecimiento.direccion = "Argentina 802 y L. de Garaycoa Mezz. Ofc. # 2";
   } else if (value.razon_social === "Asimed Lab. Centro") {
     obj2.emisor.establecimiento.direccion = "9 de octubre 1703 y Avda. del Ejército Ofc 210"
   } else if (value.razon_social === "Asimed Lab. Medical") {
     obj2.emisor.establecimiento.direccion = "Kennedy Norte atrás de Word Trade Center Avda J. Santiago Castillo Edif. Medical Plaza Ofc 104"
   } else if (value.razon_social === "Asimed Lab. Milagro") {
     obj2.emisor.establecimiento.direccion = "Cantón Milagro: Rocafuerte y García Moreno, frente antiguo Hosp. IESS";
   }; 

  obj2.moneda = "USD";

  obj2.totales = {};
  obj2.totales.total_sin_impuestos = value.total;
  obj2.totales.impuestos = [];
  objImp = {"base_imponible": value.total, "valor": "0", "codigo": "2", "codigo_porcentaje": "2"};
  //ese console.log(JSON.strigify(Objeto)) es a nivel de debug para validar que el objeto se esté grabando correctamente dentro del array
  //console.log(JSON.stringify(objImp))

  // Se hace push del objeto dentro del array
  obj2.totales.impuestos.push(objImp);

  obj2.totales.importe_total = value.total;
  obj2.totales.propina = 0.0;
  obj2.totales.descuento = 0.0;
  obj2.comprador = {};
  obj2.comprador.email = value.email;
  obj2.comprador.identificacion = value.identificacion;

  // If statement para evaluar si el paciente se registró con RUC o Cédula
  if (value.ruc === "") {
    obj2.comprador.tipo_identificacion = "05";
  } else {
    obj2.comprador.tipo_identificacion = "04";
  }
  
  obj2.comprador.razon_social = value.razon_social_paciente
  obj2.comprador.direccion = value.direccion_paciente

  if (value.celular !== "") {
    obj2.comprador.celular = value.celular;
  } else {
    obj2.comprador.telefono = value.telefono;
  }

  const objetoReturned = Object.assign(obj, objResult, obj2);


  console.log(objetoReturned);

      // Se definen las cabeceras del Post Request
     /* const headers = {
        'Content-Type': 'application/json',
        'X-Key': '<API-key>'
      }*/
      // Axios realiza el POST Request y captura la respuesta del servidor
      /*axios.get('https://link.datil.co/invoices/issue', returnedTarget, {
        headers: headers
      })
      .then((response) => {
      console.log(response.data);
      console.log(response.status);
      console.log(response.statusText);
      console.log(response.headers);
      console.log(response.config);
  });*/
      
    }

  });
});
