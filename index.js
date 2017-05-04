const  repogitData = require('./lib/data/repogitData'),
      repogitHandler = require('./lib/handlers/repogitHandler.js'),
	routes = require('./route/routes.js')

module.exports = {
			repogitData : repogitData,
			repogitHandler : repogitHandler ,
			repogitRoutes : routes
}
