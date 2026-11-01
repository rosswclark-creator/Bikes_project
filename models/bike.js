import joi from "joi";

const bikeSchema = joi.object({
  id: joi.string().required(),
  bike_type: joi.string().required(),
  size: joi.number().required(),
  colour: joi.number().required(),
});

export default bikeSchema;