// Envuelve controllers async para que cualquier error (rechazo de una
// promesa) llegue al error-handler centralizado en vez de colgar el request.
// Sin esto, habria que poner try/catch repetido en cada controller.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
