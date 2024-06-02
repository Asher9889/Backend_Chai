const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500);
  }
};

 export { asyncHandler };


//  isase fayeda ye hai ki iski as a wrapper use krenge
// jisme bhi promises ki zarurt hogi waha use kr lenge
// isaase hme baar baar promises and try catch nhi likhn apdega