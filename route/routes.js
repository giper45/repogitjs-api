const express = require('express'),
	router = express(),
	Handler = require('../lib/handlers/repogitHandler')



// JSON API
//Api labels 
router.get("/v1/root", Handler.getRootDir)
router.post("/v1/root", Handler.setRootDir)
//Pull a repo
router.get("/v1/repos", Handler.getRepos)


//Clone a repo
router.post("/v1/repos/", Handler.cloneRepo)
router.post("/v1/repos/:reponame", Handler.cloneRepo)
router.get("/v1/repos/:reponame", Handler.pullRepo)
//This launch an error
router.put("/v1/repos/", Handler.pushRepo)
router.put("/v1/repos/:reponame", Handler.pushRepo)
router.delete("/v1/repos/:reponame", Handler.deleteRepo)


module.exports = router
