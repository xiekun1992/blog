angular.module('app.service', ['ngResource'])
    .service('articleRest', ['$resource', function ($resource) {
        return $resource(
            '/article_op/:id/:flip/:position',
            {id: '@id',flip:'@index',position:'@position'},
            {post: {method: 'POST', isArray: false}, save: {method: 'PUT', isArray: false}}
        );
    }])
    .service('categoryRest',['$resource',function($resource){
        return $resource('/category/:name',{name:'@name'},{put:{method:'PUT',isArray:false}});
    }])
    .service('articleFavor', ['$http','$q',function ($http,$q) {
        var deferred=$q.defer();
        return function(id,value){
            $http.get('/article_favor',{params:{id:id}}).success(function(data,status,headers,config){
                if(200==data.status){
                    deferred.resolve(data.message);
                }else{
                    deferred.reject(data.message);
                }
            }).error(function(){deferred.reject(data.message);});
            return deferred.promise;
        }
    }])
    .service('getSpecificArticle',['articleRest','$rootScope',function(articleRest,$rootScope){
        return function (op) {//true为上一篇，false为下一篇
                var index=0;//0本文,1下一篇,-1上一篇
                index=(op?index-1:index+1);
                //请求指定的文章
                articleRest.get({id: $rootScope.$stateParams.id,flip:index,'position':$rootScope.$stateParams.position},function(data){
                    $rootScope.$emit('turnPage',data);
                    if(200==data.status){
                        if(data.message.length>0){
                            var page=parseInt($rootScope.$stateParams.page);
                            var position=data.position;
                            if(data.position>10){
                                position=1;
                                page++;
                            }else if(data.position<1){
                                position=10;
                                page--;
                            }
                            $rootScope.$state.go('app.articles.article_detail',{id:data.message[0]._id,page:page,'position':position});
                            return ;
                        }
                    }
                });
            }
    }])
    .service('getCurrentUser', ['$q', '$http', '$rootScope', function ($q, $http, $rootScope) {
        return {
            query: function () {
                var defer = $q.defer();
                $http.get('/user/current_user')
                    .success(function (data, status, headers, config) {
                        if (200 == data.status) {
                            $rootScope.user = data.message;
                            defer.resolve(data);
                        } else {
                            $rootScope.user = null;
                            defer.reject('no user online');
                        }
                    }).error(function () {
                        defer.reject();
                    });
                return defer.promise;
            }
        }
    }])
    .service('PublishOrUpdate',['$rootScope',function($rootScope){
        return {
            publish:function(){
                $rootScope.$broadcast('publish');
            },
            update:function(){
                $rootScope.$broadcast('update');
            }
        }
    }]);