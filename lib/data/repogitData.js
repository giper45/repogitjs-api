const Walker = require('walker'), 
	pathExists = require('path-exists'), 
	path = require('path'),
	mkdirp = require('mkdirp'),
	fs= require('fs'),
	appRoot = require('app-root-path') , 	
	Q = require('q'),
	process = require('process'),
	backhelp = require('./backend_helpers'),
	rimraf = require('rimraf'),
	_= require('underscore'),
	simpleGit = require('simple-git'),
	strings = require('help-nodejs').strings,
	promises= require('help-nodejs').promises

function haveToFilter(baseDir, dir) {
                var re = new RegExp(baseDir+'/?([^/]+/?){0,1}$');
                return re.test(dir);
}

const maxAttempts = 2

var invalidAuthString  = "Invalid username or password"
var failAuthError = new Error("Auth failed") 
failAuthError.code= -2


module.exports = {
	clone: function(giturl, params) {
	var numAttempts = 0
	var cloneOptions = {} ,
	url = this.getGitUrl(giturl, params)  

			var deferred = Q.defer()
			this.getRootDir(function(err, rd) {
				if(err) deferred.reject(new Error(err));
				else {
					simpleGit(rd.rootDir).silent(false).clone(url, params.reponame,['-q'], function(err, data) {
						if(err)
						{
							//If find invalidAuth String
						//	if(err.includes(invalidAuthString)) 
						//	{
						//		toRemove = strings.substring(err, invalidAuthString)
						//		err = strings.remove(err, toRemove) 
						//	}
								deferred.reject(new Error(err))

						}
						else deferred.resolve(data)
						})

				}
				
			});


		return deferred.promise	
	},
	getRootDir : function(cb) {
		jsonfile.readFile(path.join(appRoot.toString(), 'config', 'repoconf.json'), cb)
	},
	setRootDir : function(rootDir, cb) {
		jsonfile.writeFile(path.join(appRoot.toString(), 'config', 'repoconf.json'), {rootDir: rootDir}, cb)
	},

	getRepoDirs : function(nameRepo,callback) {
		var repoRet = [] 
		//Check error

			try {	
			//Try to create if doesn't exists
			if(!pathExists.sync(nameRepo) )
				callback(new Error("No exists main dir"))
			//Explore tree 
			Walker(nameRepo) 
				.filterDir(function(dir, stat) {
					return haveToFilter(nameRepo,dir)
				})
				.on('dir', function(dir, stat) {
					var gitFile = path.join(dir, '.git')
					if(pathExists.sync(gitFile))
								repoRet.push(path.basename(dir))	
					})	


				.on('end', function() {
					//Sort by name 
					var repos = _.sortBy(repoRet, function(e) {return e})
					callback(null, repos)
				})
				}

			//Cannot create, launch erro
			catch(err) 
			{
			console.log("Some error") 
			console.log(err) 
			callback(backhelp.file_not_exists(nameRepo))
			}

	},

	getGitUrl(url, params) {

		var username = (params && params.username) ? params.username  : 'git'
		var password = (params && params.password) ? params.password : 'git'
		
		var inside = strings.substring(url, "//", "@")		
		if(inside !== "")
		{
			url = strings.remove(url, inside)
			//Remove inside params
			//Add after // 
			url = strings.add(url, username+":"+password, "//")
		}
		//It doesn't contain a username 
		else 
			url = strings.add(url, username+":"+password+ "@", "//")

		return url
	},
	pullRepo(reponame, callback) {

		var deferred = Q.defer()
		pathExists(reponame).then(function(ex) {
		if(ex)
		{
			simpleGit(reponame).pull((err, data) => {
				promises.manage(deferred, err, data) 
			}) ;
		}
		else 
		{
			promises.manage(deferred, "no repo dir") 
		}
		})
		return deferred.promise	
	

	},
	pushRepo(reponame, params) {

		var deferred = Q.defer()
		pathExists(reponame).then(ex => {
		if(ex)
		{
		console.log("exists")
		var theRepo = simpleGit(reponame)
		theRepo
			 .add(path.join(reponame,'*'))
			  .addConfig('user.name', params.username)
			.addConfig('user.email', params.email)
			 .commit(params.commit)
			.push((err, data) => {
			promises.manage(deferred, err, data) 
			})
		}
		else	{ 
			console.log("Doesn't exists")
			promises.manage(deferred, "no repo dir") 
			}
		}) //End pathExists

			return deferred.promise	
	}
	


}

