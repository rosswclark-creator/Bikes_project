import database from "../services/database.js";
import {
  ScanCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import bikeSchema from "../models/bike.js";

async function getAllBikes(req, res, next) {
  try {
    const params = {
      TableName: "Bikes",
    };
    const command = new ScanCommand(params);
    const result = await database.send(command);
    res.status(200).json(result.Items);
  } catch (err) {
    next(err);
  }
}

async function createBike(req, res, next) {
  try {
    const uuid = uuidv4();
    req.body.id = uuid;
    const { error, value } = bikeSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    const { id, bike_type, size, colour } = value;

    const params = {
      TableName: "Bikes",
      Item: {
        id,
        bike_type,
        size,
        colour,
      },
    };

    const command = new PutCommand(params);

    await database.send(command);

    res
      .status(201)
      .json({ message: "Successfully created bike", data: params.Item });
  } catch (error) {
    next(error);
  }
}

async function getBikeById(req, res, next) {
  const bikeId = req.params.id;
  try {
    const params = {
      TableName: "Bikes",
      Key: { id: bikeId },
    };
    const command = new GetCommand(params);
    const result = await database.send(command);
    if (!result.Item) {
      return res.status(404).json({ message: "No bike found" });
    }
    res.status(200).json(result.Item);
  } catch (err) {
    next(err);
  }
}

async function updateBikeById(req, res, next) {
  try {
    const bikeId = req.params.id;
    req.body.id = bikeId;
    const { error, value } = bikeSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { bike_type, size, colour } = value;

    // Get the movie from DynamoDB
    const getParams = {
      TableName: "Bikes",
      Key: { id: bikeId },
    };

    const getCommand = new GetCommand(getParams);

    const result = await database.send(getCommand);

    const bike = result.Item;

    if (!bike) {
      return res.status(404).json({ message: "No bike found" });
    }

    // Update the bike in DynamoDB
    const updateParams = {
      TableName: "Bikes",
      Key: { id: bikeId },
      UpdateExpression:
        "set #bike_type = :bike_type, #size = :size, #colour = :colour",
      ExpressionAttributeNames: {
        "#bike_type": "bike_type",
        "#size": "size",
        "#colour": "colour",
      },
      ExpressionAttributeValues: {
        ":bike_type": bike_type,
        ":size": size,
        ":colour": colour,
      },
      ReturnValues: "ALL_NEW",
    };
    const updateCommand = new UpdateCommand(updateParams);
    const updatedBike = await database.send(updateCommand);

    res.status(200).json(updatedBike.Attributes);
  } catch (err) {
    next(err);
  }
}

async function deleteBikeById(req, res, next) {
  const bikeId = req.params.id;
  try {
    const params = {
      TableName: "Bikes",
      Key: { id: bikeId },
    };
    const command = new DeleteCommand(params);
    await database.send(command);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export default {
  getAllBikes,
  createBike,
  getBikeById,
  updateBikeById,
  deleteBikeById,
};