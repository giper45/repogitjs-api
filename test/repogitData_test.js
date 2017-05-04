const expect = require('chai').expect,
assert = require('chai').assert,
appRoot = require('app-root-path'),
path = require('path'),
repogitData = require(appRoot+"/lib/data/repogitData") , 
gitProj = require('./data/git_test.json'),
rimraf = require('rimraf') 



describe("repogitData test", function() {

	var self = this
	before(function(){
		if(!gitProj) 
		{
			console.error("Pls set git_test.json fist") 
		}
		self.dirExpected = gitProj.dirProj 
		self.projPath = path.join(appRoot.toString(), 'test', 'git_test')
		self.testClone = path.join(appRoot.toString(), 'test', 'git_to_clone')
		self.timeout = 10000
		//remove newRepo dir 
		rimraf.sync(path.join(appRoot.toString(),'test','git_to_clone','newRepo'))	
		rimraf.sync(path.join(appRoot.toString(),'test','git_to_clone','repogitjs'))	

	})
	it("Should return correct repodirs with git", function(done) { 
		repogitData.getRepoDirs(self.projPath, function(err, repos) {
			expect(err).to.be.null
			expect(repos).to.be.eql(self.dirExpected) 
			done()

		})
	})

	it("Should return an error if path doesn't exists", function(done) { 
			repogitData.getRepoDirs("impossibletoexiststhispath", function(err, repos) {
				expect(err).not.to.be.null
				done()
			})		

	})
	it("Clone test: should clone a public repo", function() { 
		this.timeout(10000)

		var thePath = path.join(self.testClone, 'repogitjs')
		console.log(thePath)
		return repogitData.clone("https://github.com/giper45/repogitjs", {reponame:thePath} )
		.then(function success(response) {
			assert(response != null , "Success")
		},
			function error(response) {
				console.log(response)
				assert(response == null, "Failure")
		})
	})

	it("Clone test already existend : should give error already existent", function() {
		
		return repogitData.clone("https://github.com/giper45/repogitjs", {reponame:path.join(self.testClone, "alreadyExists")} )
		.then(function success(response) {
			assert(response == null , "Failure")
		},
			function error(response) {
				assert(response != null, "Success")
		})

	})

	//auth need  : -1
	it("Clone test private auth: should return the error promise with a particular error code", function() {

		this.timeout(10000)
		return repogitData.clone("https://gp88@bitbucket.org/gp88/testrepo.git", {reponame:path.join(self.testClone, "authRepo")} )
		.then(function success(response) {
			
			return false	
		},
			function error(response) {
				return false
		})

	});



	 testGitUrl  = ()=> {
		var tests = [
		{
			name : "simple gitlab ",
			url: "https://g.per45@gitlab.com/g.per45/testlab.git",	
			expected: "https://git:git@gitlab.com/g.per45/testlab.git",	
		}, 
		{
			name :" http github", 
			url: "http://github.com/nodegit/nodegit",	
			expected: "http://git:git@github.com/nodegit/nodegit",	
		}, 
		{
			name :" https github", 
			url: "https://github.com/nodegit/nodegit",	
			expected: "https://git:git@github.com/nodegit/nodegit",	
		},
		{
			name :" http github with auth", 
			url: "https://gp88@bitbucket.org/gp88/testrepo.git",	
			expected: "https://test:pwdtest@bitbucket.org/gp88/testrepo.git",	
			params : {username:'test', password:'pwdtest'}
		}
		]
		
		tests.forEach((t) => {
			it("should be equal", ()=>{
			var url = repogitData.getGitUrl(t.url, t.params)
			expect(url).to.be.eql(t.expected) 
			})
		})

	}
	testGitUrl()


})
