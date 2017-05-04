var fs = require('fs'),
    appRoot = require('app-root-path'),
    path = require('path')  ,
    pathExists = require('path-exists')


exports.errors = {
	no_valid_name: function(name) {  
	return { 
		code : 1 ,
		message : ""+name+" is not valid name" 	
		}
	},
	already_exists: function already_exists(name) {  
	return { 
		code : 2 ,
		message : name+" file already exists" 
		}
	},
	label_not_found: function label_not_found() {  
	return { 
		code : 3 ,
		message : "labels not found" 
		}
	},
	label_already_exists: function label_already_exists() {  
	return { 
		code : 4 ,
		message : "labels already exists" 
		}
	},
	notDefined: function notDefined(name) {  
	return { 
		code : 5 ,
		message : name+" not defined" 
		}
	}
	


}
exports.error = function (e) {
    var error = new Error(e.message);
    error.code = e.code;
    return error;
};
exports.errorEmpty = function(val) { 
	var error = new Error(val+" cannot be empty") 
	   error.code = 3 
	return error
}
exports.path_userconfig = function() {
if(c.test) 
	return appRoot.path +'/config/test_user.json';
	else return  appRoot.path + '/config/config_user.json' 
}

exports.verify = function (data, field_names) {
    for (var i = 0; i < field_names.length; i++) {
        if (!data[field_names[i]]) {
            throw exports.error("missing_data",
                                field_names[i] + " not optional");
        }
    }

    return true;
}


exports.file_error = function (err) {
    return exports.error("file_error", JSON.stringify(err.message));
}
exports.getDirectories = function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

/**
 * Possible signatures:
 *  src, dst, callback
 *  src, dst, can_overwrite, callback
 */
exports.file_copy = function () {

    var src, dst, callback;
    var can_overwrite = false;

    if (arguments.length == 3) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[2];
    } else if (arguments.length == 4) {
        src = arguments[0];
        dst = arguments[1];
        callback = arguments[3];
        can_overwrite = arguments[2]
    }

    function copy(err) {
        var is, os;
 
        if (!err && !can_overwrite) {
            return callback(backhelp.error("file_exists",
                                           "File " + dst + " exists."));
        }
 
        fs.stat(src, function (err) {
            if (err) {
                return callback(err);
            }

            is = fs.createReadStream(src);
            os = fs.createWriteStream(dst);
            is.on('end', function () { callback(null); });
            is.on('error', function (e) { callback(e); });
            is.pipe(os);
        });
    }
    
    fs.stat(dst, copy);
};
//Returns true if is a lab 
exports.isDSPDir = function(dir, callback) {

			var filename = path.join(dir, '.dsp')
			pathExists(filename).then(function(exists) {
				callback(exists)
			})
}

exports.fileExists = function(filename, callback) {

			fs.stat(filename, function(err, stats)  { 
				// If null already exists
				if(err === null) 
				{
					
					callback(null, true)	
				}
				// Not found error : ok  
				else if(err.code === 'ENOENT') 
				{ 
					callback(null, false)	
				}
				//Another error 
				else  callback(err)
			}) 


}
exports.valid_path = function(fn) {
	return true
}

exports.valid_filename = function (fn) {
    var re = /[^\.a-zA-Z0-9_-]/;
    return typeof fn == 'string' && fn.length > 0 && !(fn.match(re));
};


exports.db_error = function () {
    return exports.error("server_error",
        "Something horrible has happened with our database!");
}

exports.file_not_exists = function(path) {
    return exports.error({ message:"file "+ path+ " doesn't exists",
		code:-1});

}
exports.album_already_exists = function () {
    return exports.error("album_already_exists",
                         "An album with this name already exists.");
};
