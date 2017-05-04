const path = require('path'),
	appRoot = require('app-root-path') , 	
	homedir = require('homedir')
	repoConfig = require(appRoot+"/config/repoconf.json"),
	repogitData = require('../data/repogitData'),
	async = require('async'), 
	_ = require('underscore') ,
	rimraf = require('rimraf'),
	helpers =  require('./helpers'),
	jsonfile = require('jsonfile'),
	httpHelper = require("help-nodejs").httpHelper



var api = {
	getRootDir : function(req, res) {

		var rootDir = repoConfig.rootDir
		helpers.response(res, null, rootDir) 	
	} ,
	setRootDir : function(req, res) { 
		
		console.log("SET ROOT DIR")
	       async.waterfall([	
		(cb) => (!req.body || !req.body.rootDir)? cb(helpers.bodyNoCorrect(['rootDir'])) : cb(null), 
		(cb) =>  repogitData.setRootDir(req.body.rootDir, cb)
		],
		(err) => helpers.response(res, err)
		)
			

	},

	//Clone a repo
	cloneRepo : function(req, res) {
		console.log("in clone repo") 

		async.waterfall([
			//Check params
			function(cb)  {
				if(!req.params || !req.params.reponame) 
					cb(helpers.paramError('reponame'))
				//Check body
				else if (!req.body || !req.body.giturl) 
					cb(helpers.bodyNoCorrect(['giturl']))

				//If authRequired is true check username and password body params
				else if (req.body.authRequired && (!req.body.username || !req.body.password))
					cb(helpers.bodyNoCorrect(['username', 'password']))
				else 
				{
				var reponame = req.params.reponame
				var giturl = req.body.giturl
				//TODO Checks in parameters 

				//Extend params 
				var params = _.extend({} , {reponame:path.join(homedir(),repoConfig.rootDir, reponame)}, req.body)
				cb(null, params)
				}
			}, 
			//Git clone
			function(params, cb) {

				var promises =  repogitData.clone(params.giturl, params)
				promises.then(
				function success(repository)	
				{
					console.log("success")
					cb(null)	
				},
				function error(e)	
				{
					/* CANNOT GET THE AUTH ERROR CODE FOR THE MOMENT */
//					//Check for code error 
//					//Need auth error
//					if(e.toString() === errMessages.noAuthInserted)
//					{
//						cb(helpers.authRequired())
//
//					}
					//No special error, simply returns the error 
					//else 
						cb(e)	
				})

			}

		]
		,
		function(err) {
			helpers.response(res,err)
		})	

	} ,
	deleteRepo : function(req, res) {
		console.log("inDeleteRepo")
		if(req.params && req.params.reponame) {
			rimraf(path.join(homedir(), repoConfig.rootDir, req.params.reponame), function(err) {
				if(err) 		
					helpers.response(res,err)
				else helpers.response(res,null)

			})
		}

		else helpers.response(res,helpers.paramError('reponame'))
	
	},
	//Returns 
	getRepos : function(req, res) {
		console.log("sono in get repos")
		var rootDir = repoConfig.rootDir
		var rootPath = path.join(homedir(), rootDir)  
		repogitData.getRepoDirs(rootPath, function(err, rootDirs) { 

			console.log("ERR : ") 
			console.log(err) 
			helpers.response(res, err, rootDirs)
		})

	},
	pushRepo : function(req, res) {
		console.log("sono in push")
		if(!req.params || !req.params.reponame) 
			helpers.response(res, helpers.paramError('reponame'))
		else if(!req.body || !req.body.username || !req.body.mail || !req.body.commit)	
			helpers.response(res, helpers.bodyNoCorrect(['username', 'mail', 'commit']))

		else {
			console.log("sono in push repo")
			var thePath = path.join(homedir(), repoConfig.rootDir, req.params.reponame)
			repogitData.pushRepo(thePath, req.body)
			.then( 
				success = (data)=>{ 
					console.log("success")
					helpers.response(res, null)
				} , 

				error = (err) => {
					console.log("error")
					helpers.response(res, err)

				}	
			 )

			}



	}, 
	pullRepo : function(req, res) {
		console.log("in pull repos")
		//Test validity param
		if(!req.params || !req.params.reponame) 
			helpers.response(res, helpers.paramError('reponame'))
		else {
			repogitData.pullRepo(path.join(homedir(), repoConfig.rootDir,req.params.reponame))
			.then( 
				success = (data)=>{ 
					console.log("success")
					helpers.response(res, null)
				} , 

				error = (err) => {
					console.log("error")
					helpers.response(res, err)

				}	
			 )

		}
	}
}


module.exports = api
