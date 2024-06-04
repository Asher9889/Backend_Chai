import { ApiError } from "./ApiError.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      statusCode: error.status,
      message: error.message,
    })
  }
};

 export { asyncHandler };


// isase fayeda ye hai ki iski as a wrapper use krenge
// jisme bhi promises ki zarurt hogi waha use kr lenge
// isaase hme baar baar promises and try catch nhi likhn apdega