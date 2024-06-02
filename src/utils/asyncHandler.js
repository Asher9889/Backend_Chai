const asyncHandler = (fn) => async (res, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500);
  }
};

 export { asyncHandler };
