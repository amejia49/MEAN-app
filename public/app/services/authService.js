//factory for handling tokens
//inject $window to store token client-side
angular.module('authService', [])
//=========================================
//auth factory to login and get info
//inject $http for communicating with the API
//inject $q to return promise objects
//inject AuthToken to manage tokens
//=========================================

.factory('Auth', function($http,$q, AuthToken){

	//create auth factory object

	var authFactory= {};

	//log user in

	authFactory.login =function(username,password){
		//return the promise object and its data
		return $http.post('/api/authenicate',{
			username:username,
			password: password
		})
		.success(function(data){
			AuthToken.setToken(data.token);
			return data;
		});
	};
	authFactory.logout= function(){
		//clear token
		AuthToken.setToken();
	};

	//checks if user is logged in
	//checks if there is a local token
	authFactory.isLoggedIn= function(){
		if (AuthToken.getToken())
			return true;
		else
			return false;
	};

	//get the logged in user
	authFactory.getUser =function(){
		if(AuthToken.getToken())
			return $http.get('/api/me');
		else 
			return
			$q.reject({message:'User has no token'});
	};

	return authFactory;
})
.factory('AuthToken', function($window){
	var authTokenFactory= {};

	//get token out of local storage

	authTokenFactory.getToken=function(){
		return $window.localStorage.getItem('token');
	};

	//function to set token or clear token
	//if token is passed, set token
	//if there is no token, clear it from local storage

	authTokenFactory.setToken = function(token){
		if (token)
			$window.localStorage.setItem('token', token);
		else
			$window.localStorage.removeItem('token');
	};

	return authTokenFactory;
})
//AuthInterceptor factory will be responsible..
// for attaching the token to all HTTP requests coming..
// from frontend Application

.factory('AuthInterceptor',function($q, $location, AuthToken)
{
	var inteceptorFactory = {};
	//this will happen on all HTTP requests
	inteceptorFactory.request= function(config){

		//grab the token
		var token= AuthToken.getToken();

		//if the token exists, add it to the header a x-access-token
		if (token)
			config.headers['x-access-token'] = token;
		return config;
	};

	//response errors
		inteceptorFactory.responseError= function(response){
			if (response.status==403)
				$location.path('/login');
			return $q.reject(response);
		};
		return inteceptorFactory;
});
		