angular.module('mainCtrl',[])

.controller('mainController', function($rootScope, $location, Auth){

	var vm= this;

	//get info if a person is logged in

	vm.loggedIn =Auth.isLoggedIn();

	//check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function(){
		vm.loggedIn=Auth.isLoggedIn();
	});

	//get user info on page load
	Auth.getUser()
		.success(function(data){
			vm.user=data;
		});

		//function to handle login form
		vm.doLogin= function(){
			//call Auth.login() function
			 vm.processing = true;
			Auth.login(vm.loginData.username,vm.loginData.password)
				.success(function(data){
					vm.processing = false;
					//get user info after logging in
				Auth.getUser()
				.then(function(data){
					vm.user=data.data;
				});

				//if a user successfully logs in, redirect to users page
				$location.path('/users');
				});
		};
		//function to handle logging out
		vm.doLogout= function(){
			Auth.logout();
			$location.path('/');
		};
});