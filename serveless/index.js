import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "us-east-2" });

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const handler = async (event) => {
  try {
    console.log("Event:", event);

    const { requestContext, body: requestBody } = event;
    const httpMethod = requestContext.http.method;
    const path = requestContext.http.path;

    // Obtener un paciente por ID
    if (httpMethod === "GET" && path.startsWith("/patients/")) {
      const id = path.split("/").pop();
      const params = { TableName: "Patients", Key: { id: { S: id } } };

      const { Item } = await dynamoDB.send(new GetItemCommand(params));
      if (!Item) return { statusCode: 404, body: JSON.stringify({ message: "Patient not found" }) };

      return { statusCode: 200, body: JSON.stringify({
        id: Item.id.S, firstName: Item.firstName.S, lastName: Item.lastName.S,
        gender: Item.gender.S, birthDate: Item.birthDate.S, email: Item.email.S, phone: Item.phone.S,
        externalData: { country: Item.externalData.M.country.S, address: Item.externalData.M.address.S },
        createdAt: Item.createdAt.S, updatedAt: Item.updatedAt.S
      }) };
    }

    // Obtener todos los pacientes
    if (httpMethod === "GET" && path === "/patients") {
      const { Items } = await dynamoDB.send(new ScanCommand({ TableName: "Patients" }));
      const patients = Items.map(item => ({
        id: item.id.S, firstName: item.firstName.S, lastName: item.lastName.S,
        gender: item.gender.S, birthDate: item.birthDate.S, email: item.email.S, phone: item.phone.S,
        externalData: { country: item.externalData.M.country.S, address: item.externalData.M.address.S },
        createdAt: item.createdAt.S, updatedAt: item.updatedAt.S
      }));
      return { statusCode: 200, body: JSON.stringify(patients) };
    }

    // Crear un nuevo paciente
    if (httpMethod === "POST" && path === "/patients") {
      if (!requestBody) return { statusCode: 400, body: JSON.stringify({ message: "Invalid request body" }) };

      const body = JSON.parse(requestBody);
      const id = generateUUID();
      const timestamp = new Date().toISOString();

      const response = await fetch("https://randomuser.me/api/");
      const data = await response.json();
      const user = data.results[0];

      const firstName = user.name.first;
      const country = user.location.country;
      const address = `${user.location.street.name}, ${user.location.city}`;

      const params = {
        TableName: "Patients",
        Item: {
          id: { S: id },
          firstName: { S: firstName },
          lastName: { S: body.lastName || "" },
          gender: { S: body.gender || "other" },
          birthDate: { S: body.birthDate || "" },
          email: { S: body.email || "" },
          phone: { S: body.phone || "" },
          externalData: { M: { country: { S: country }, address: { S: address } } },
          createdAt: { S: timestamp },
          updatedAt: { S: timestamp }
        }
      };

      await dynamoDB.send(new PutItemCommand(params));
      return { statusCode: 201, body: JSON.stringify({ message: "Patient created", id }) };
    }

    // Actualizar un paciente
    if (httpMethod === "PATCH" && path.startsWith("/patients/")) {
      const id = path.split("/").pop();
      if (!requestBody) return { statusCode: 400, body: JSON.stringify({ message: "Invalid request body" }) };

      const body = JSON.parse(requestBody);
      const timestamp = new Date().toISOString();

      const params = {
        TableName: "Patients",
        Key: { id: { S: id } },
        UpdateExpression: "SET lastName = :lastName, gender = :gender, birthDate = :birthDate, email = :email, phone = :phone, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":lastName": { S: body.lastName || "" },
          ":gender": { S: body.gender || "other" },
          ":birthDate": { S: body.birthDate || "" },
          ":email": { S: body.email || "" },
          ":phone": { S: body.phone || "" },
          ":updatedAt": { S: timestamp }
        },
        ReturnValues: "ALL_NEW"
      };

      await dynamoDB.send(new UpdateItemCommand(params));
      return { statusCode: 200, body: JSON.stringify({ message: "Patient updated", id }) };
    }

    // Eliminar un paciente
    if (httpMethod === "DELETE" && path.startsWith("/patients/")) {
      const id = path.split("/").pop();
      await dynamoDB.send(new DeleteItemCommand({ TableName: "Patients", Key: { id: { S: id } } }));
      return { statusCode: 200, body: JSON.stringify({ message: "Patient deleted", id }) };
    }

    return { statusCode: 404, body: JSON.stringify({ message: "Route not found" }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Server error", error: error.message }) };
  }
};
