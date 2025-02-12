const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    //I didn't understand why this happened. I think it's because the key is listing, and the value is an object with keys title, description, etc.
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});



// module.exports = listingSchema;