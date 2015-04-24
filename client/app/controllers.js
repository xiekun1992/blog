angular.module('app.controller', [])
	.controller('loginCtrl', ['$scope', '$rootScope', '$http','$cookieStore','$timeout',
		function($scope, $rootScope, $http, $cookieStore, $timeout) {
			$scope.username;
			$scope.password;
            $scope.autoLogin=true;
            $scope.errorInfo="";
            $scope.error = false;
            $scope.key;
            $rootScope.animation = "articles";
            $scope.response=$scope.login=$scope.logout=false;
			$scope.signOut=function(){

				$http.get('/user/logout',{params:{id:$rootScope.user._id}})
                    .success(function(data,status,headers,config){
                        if(200==data.status){
                            $rootScope.$state.go('app.articles.article_list',{page:1});
                            $cookieStore.remove("ordinary'blog");
                            $rootScope.user=null;
                        }
                    }).error(function(){});
			}
			$scope.signIn = function(arg) {
                var config={username: $scope.username,password: $scope.password && hex_md5($scope.password)};
                if(arg){//cookie存在则自动登录
                    config.cookie=arg;
                }else if($scope.autoLogin){//无cookie则检查是否需要自动登录
                    config.auto=true;
                }
                console.log(config)
				$http.post('/user/login', {params: config})
					.success(function(data, status, headers, config) {
                        if (200 == data.status) {
							$rootScope.user = data.message;
                            angular.element("#loginModal").modal('hide');
                            $scope.password=null;
                            if(data.message.auto_login) {
                                $cookieStore.put("ordinary'blog", data.message.auto_login);
                            }
						}else{
                            $scope.errorInfo = data.message;
                            $scope.error = 'blog-error';
                            $timeout(function(){
                                $scope.errorInfo=null;
                            },1500);
                        }
					});
			}
            var k=$cookieStore.get("ordinary'blog");
            if(k){
                $scope.signIn(k);
            }
			$scope.forgetPwd=function(){
				$http.get('/user/reset_password').success(function(data){
                    $scope.errorInfo = data.message;
                    $scope.error = (data.status == 200 ? "blog-success" : "blog-error");
                    $timeout(function(){
                        $scope.errorInfo=null;
                    },1500);
				});
			}
            //控制密码显隐
            $scope.pwd = "password";
            $scope.eyeIcon = "glyphicon-eye-open";
            $scope.mention = "显示密码";
            $scope.eye = function () {
                if ($scope.pwd == "password") {
                    $scope.pwd = "text"
                    $scope.eyeIcon = "glyphicon-eye-close";
                    $scope.mention = "隐藏密码";
                } else {
                    $scope.pwd = "password"
                    $scope.eyeIcon = "glyphicon-eye-open";
                    $scope.mention = "显示密码";
                }
            }
		}
	])
    //密码重置
	.controller('passwordCtrl', ['$scope','$rootScope','$http','$timeout', function ($scope,$rootScope,$http,$timeout) {
		//密码
		$scope.p1
		$scope.p2
		//验证token的有效性
		$http.get('/user/password/token?key='+$rootScope.$state.params.token)
		.success(function(data){
			if(200!=data.status){
				$rootScope.$state.go('app.articles.article_list',{page:1});
			}
		}).error(function(){
			$rootScope.$state.go('app.articles.article_list',{page:1});
		});
		//重置为新密码
        var jumpCounter;
		$scope.reset=function(){
			$scope.alert=false;
			$scope.p1=hex_md5($scope.p1)
			$http.post('/user/password/new',{params:{p:$scope.p1,key:$rootScope.$state.params.token}})
			.success(function(data){
				if(200==data.status){
					$scope.p1=$scope.p2=null;
                    $scope.alertWarning=false;
                    $scope.alert=true;
                    $scope.counter=5;
                    jumpCounter=setInterval(function(){
                        $scope.$apply($scope.counter=$scope.counter-1);//更新页面上的值
                        if($scope.counter<=0) {
                            $rootScope.$state.go('app.articles.article_list',{page:1});
                            clearInterval(jumpCounter);
                        }
                    },1000);
                }else{
                    $scope.alert=false;
                    $scope.alertWarning=true;
                }
                $scope.msg=data.message;
			}).error(function(){});
		}
        $scope.jumpToIndex=function(){
            clearInterval(jumpCounter);
            $rootScope.$state.go('app.articles.article_list',{page:1});
        }
        $scope.$on('$destroy',function(event){
            clearInterval(jumpCounter);
        });
	}])
	//文章的总结构
	.controller('articlesCtrl', ['$scope', '$rootScope', '$http', '$location', '$timeout', function($scope, $rootScope, $http, $location, $timeout) {
		$scope.search = function(event) {
			if (event.keyCode == 13) {
				$rootScope.$state.go('app.articles.search', {
					keyword: $scope.key,
					p: 1
				});
			}
		}
		//文章分类链接
		$scope.categoryLink = function(category) {
			$scope.request = '/article_list?category=' + category;
			$rootScope.execSearch = true;
			$rootScope.$state.go('app.articles.article_list',{page:1});
		}
	}])
	//右侧文章列表
	.controller('articleListCtrl', ['$scope', '$rootScope', '$http','articleRest','articleFavor',
        function($scope, $rootScope, $http,articleRest,articleFavor) {
		$scope.articles=[];
		$scope.request = '/article_list?';
        $scope.currentPage=parseInt($rootScope.$stateParams.page) || 1;
		$scope.noResult;
		$scope.execSearch = true;//启动分页搜索


        //喜欢文章
        $scope.favor=function(obj){
            articleFavor(obj._id).then(function(){
                obj.favor++;
            });
        }
        //修改文章
		$scope.edit=function(id){
			$rootScope.$state.go('app.articles.edit',{id:id,'page':$rootScope.$stateParams.page,position:0});
		}
        //删除文章
		$scope.delete=function(id){
			articleRest.remove({'id':id},function(data){
                if(200==data.status){
                    angular.forEach($scope.articles,function(a,key){
                        if(a._id==id){
                            $scope.articles.splice(key,1);
                            if($scope.articles.length<=0){
                                $scope.request = '/article_list?';
                                $scope.currentPage=parseInt($rootScope.$stateParams.page) || 1;
                                $scope.execSearch = true;
                            }
                            return;
                        }
                    });
                }
			});
		}
	}])
	//右侧文章详情页
	.controller('articleDetailCtrl', ['$scope', '$rootScope', 'articleRest','articleFavor',
        function($scope, $rootScope, articleRest, articleFavor) {
		//restful请求单条文章数据
		articleRest.get({
			'id': $rootScope.$stateParams.id,'flip':0,'position':$rootScope.$stateParams.position
		}, function(data) {
            $rootScope.$emit('turnPage',data);
			if(200==data.status)
				$scope.article = data.message;
		});
        //返回到文章列表页
        $scope.back=function(){
            $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
        }
        //喜欢文章
        $scope.favor=function(obj){
            articleFavor(obj._id).then(function(){
                obj.favor++;
            });
        }
        //修改文章
        $scope.edit=function(id){
            $rootScope.$state.go('app.articles.edit',{id:id,'page':$rootScope.$stateParams.page,position:0});
        }
        //删除文章
        $scope.delete=function(id){
            articleRest.remove({'id':id},function(data){
                if(200==data.status){
                    angular.forEach($scope.articles,function(a,key){
                        if(a._id==id){
                            $scope.articles.splice(key,1);
                            return;
                        }
                    });
                    $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
                }
            });
        }
	}])
    //搜索
	.controller('searchCtrl', ['$scope', '$rootScope','$http', function($scope, $rootScope,$http) {
		$scope.searchResults;
		$scope.request='/search?keyword=' + $rootScope.$state.params.keyword+ '&p=' + $rootScope.$state.params.p;
		$scope.execSearch=true;
	}])
    //编辑文章
	.controller('editCtrl', ['$scope', 'articleRest','$rootScope', 
		function($scope, articleRest,$rootScope) {
        $scope.welcome='写点东西吧';
        $scope.data={};
		$scope.category = ['Angular', 'Node', 'MongoDB'];
        $scope.result=false;//true:ajax请求响应成功
		//发布文章
		$scope.operate = function(op,content, title, category) {//op 1:发表，0:更新
			if(op){//新建文章
				if (content && title) {
					articleRest.save({
						'title': title,
						'content': content,
						'category': category,
						'create_time': new Date()
					}, function(data) {
						if(200==data.status){
							$scope.result=true;
                            $scope.data={};
							window.scrollTo(0,0);
						}
					});
				}
			}else{//修改文章
				articleRest.post({
					'id':$rootScope.$stateParams.id,
					'title': title,
					'content': content,
					'category': category
				},function(data){
					if(200==data.status){
						$rootScope.$state.go('app.articles.article_list',{page:1});
                        $scope.result=true;
                        $scope.data={};
					}
			    });
			}
			
		}
		//传入的id不为空则获取文章
		if($rootScope.$stateParams.id){
            if($rootScope.$stateParams.id.length==24) {
                $scope.op = 0;
                articleRest.get({'id': $rootScope.$stateParams.id, 'flip': 0, position: $rootScope.$stateParams.position}, function (data) {
                    if (200 == data.status) {
                        $scope.data = data.message;
                        $scope.welcome = '正在修改已有文章';
                    }
                });
            }else if($rootScope.$stateParams.id==-1){
                $scope.data.content='<p><br></p>';
            }
		}
        //返回到文章列表页
        $scope.back=function(){
            $rootScope.$state.go('app.articles.article_list',{page:$rootScope.$stateParams.page});
        }
	}])
    .controller('trashCanCtrl',['$scope','$http',function($scope,$http){
        $scope.articleUseless=[];
//        $http.get('/trash_can').success(function(data,status,headers,config){
//            if(200==data.status){
//                $scope.articleUseless=data;
//            }
//        });
    }]);