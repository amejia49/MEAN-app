
angular.module('userApp',[

	'ngAnimate',
	'appRoutes',
	'authService',
	'mainCtrl',
	'userService'])

// application configuration to integrate token into requests
.config(function($httpProvider) {

	// attach our auth interceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');

});