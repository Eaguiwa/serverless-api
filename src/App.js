import React from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const swaggerSpec = {
  
    "openapi": "3.0.0",
    "info": {
      "title": "Patients API",
      "version": "1.0.0",
      "description": "API para gestionar pacientes en DynamoDB usando AWS Lambda y API Gateway."
    },
    "servers": [
      {
        "url": "https://8kak7cjieb.execute-api.us-east-2.amazonaws.com",
        "description": "API Gateway AWS"
      }
    ],
    "paths": {
      "/patients": {
        "get": {
          "summary": "Obtener todos los pacientes",
          "operationId": "getPatients",
          "responses": {
            "200": {
              "description": "Lista de pacientes obtenida correctamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Patient"
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "summary": "Crear un nuevo paciente",
          "operationId": "createPatient",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PatientInput"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Paciente creado exitosamente",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": { "type": "string" },
                      "id": { "type": "string" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/patients/{id}": {
        "get": {
          "summary": "Obtener un paciente por ID",
          "operationId": "getPatientById",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": {
              "description": "Paciente encontrado",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/Patient" }
                }
              }
            },
            "404": {
              "description": "Paciente no encontrado"
            }
          }
        },
        "patch": {
          "summary": "Actualizar un paciente",
          "operationId": "updatePatient",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/PatientInput" }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Paciente actualizado correctamente"
            }
          }
        },
        "delete": {
          "summary": "Eliminar un paciente",
          "operationId": "deletePatient",
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": {
              "description": "Paciente eliminado correctamente"
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Patient": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "firstName": { "type": "string" },
            "lastName": { "type": "string" },
            "gender": { "type": "string" },
            "birthDate": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" },
            "externalData": {
              "type": "object",
              "properties": {
                "country": { "type": "string" },
                "address": { "type": "string" }
              }
            },
            "createdAt": { "type": "string" },
            "updatedAt": { "type": "string" }
          }
        },
        "PatientInput": {
          "type": "object",
          "properties": {
            "lastName": { "type": "string" },
            "gender": { "type": "string" },
            "birthDate": { "type": "string" },
            "email": { "type": "string" },
            "phone": { "type": "string" }
          }
        }
      }
    }
  
  
};

export default function App() {
  return <SwaggerUI spec={swaggerSpec} />;
}
