angular.module('app.directive', [])
    .directive('emoji', ['$timeout', function ($timeout) {
        return {
            scope: {

            },
            transclude: true,
            templateUrl: 'tpls/partials/emoji.html',
            link: function (scope, element, attrs) {
                //示例生成emoji图片输入
                scope.emojiData = [];
                scope.show = false;
                scope.changeShow = function () {
                    element.find("ul.emoji-pak").css('opacity', 0).css('display', 'none');
                    $timeout(function () {
                        element.find("ul.emoji-pak").css('display', '').css('opacity', 1);
                    }, 100);
                }
                var emos = getEmojiList()[0]; //此处按需是否生成所有emoji
                for (var j = 0; j < emos.length; j++) {
                    var emo = emos[j];
                    var data = 'data:image/png;base64,' + emo[2];
                    scope.emojiData.push({
                        'data': data,
                        'emo': emo[1]
                    });
                }

                function fillContent(obj) {
                    var img = obj.src;
                    var text = document.getElementById('text');
                    console.log(obj.outerHTML)
                    var tmp = decode(obj.outerHTML);
                    text.innerHTML += parse(tmp);
                    // text.focus();
                }

                //反解析（web上，图片数据转为emoji字符编码存储）
                function decode(htmlStr) {
                    //todo 正则替换性能更优？unicode16='1f603'
                    if (typeof ioNull == 'undefined') {
                        return '';
                    }
                    var tempStr = htmlStr,
                        unis = '',
                        $imgs = $('<div>').append(htmlStr).find('img');
                    $.each($imgs, function (i, o) {
                        var $img = $(o);
                        var unicode16 = '0x' + $img.attr('unicode16'); //十六进制
                        unicode16 = ioNull.emoji.decodeChar(unicode16);
                        // unis += unicode16;
                        tempStr = tempStr.replace($('<div>').append($img).html(), unicode16);
                    });
                    // console.log(unis)
                    return tempStr;
                }

                //解析存储的emoji表情
                function parse(arg) {
                    if (typeof ioNull != 'undefined') {
                        return ioNull.emoji.parse(arg);
                    }
                    return '';
                }
            }
        }
    }])
    .directive('alink', [function () {
        return {
            scope: {

            },
            transclude: true,
            templateUrl: 'tpls/partials/alink.html',
            link: function (scope, element, attrs) {
                scope.showInput = function (event) {
                    element.find(event.currentTarget).siblings('div').toggleClass('show-input');
                }
            }
        }
    }])
/**
 * 分页器
 * @param {scope} list ajax返回的当前页的数据
 * @param {scope} request 每次请求的url(可能带有参数)
 * @param {scope} no-result 当请求不到数据时,显示该变量的值("暂无数据")
 * @param {scope} show-last boolean是否显示末页按钮
 */
    .directive('page', function ($http,$rootScope) {
        return {
            restrict: "AE",
            scope: {
                list: '=',
                request: '=',
                noResult: '=',
                execSearch: '=',
                currentPage: '='
            },
            templateUrl: "tpls/partials/pagination.html",
            link: function (scope, element, attrs) {
                //每次变化一级时发生改变,确定所在一级的起始页号,每5个按钮为一级,末页所在一级不论按钮个数
                scope.start = 1;
                //当前的页数
                scope.currentPage = scope.currentPage || 1;
                //分页长度,5个按钮与scope.pages对应
                scope.paginationLength = 5;
                scope.pages = [0, 1, 2, 3, 4];
                //最大页数初始化
                scope.maxPage = 1;
                /**
                 * 根据相应的url,ajax获取当前页的数据
                 */
                scope.search = function () {
                    var url;
                    if (scope.request.indexOf('&p=') > -1) {
                        url = scope.request;
                    } else {
                        url = scope.request + '&p=' + scope.currentPage;
                    }
                    $http.get(url, {})
                        .success(function (data, status, headers, config) {
                            scope.list = data;
                            //返回的数据条数除以10上取整来确定最大页数
                            scope.maxPage = Math.ceil(headers('count') / 10) || 1;
                            scope.noResult = "";
                            //回到页面最上方
                            window.scrollTo(0, 0);
                        })
                        .error(function (data) {
                            scope.list = [];
                            scope.maxPage = 1;
                            scope.noResult = "暂无数据";
                        });
                }
                // scope.search();
                //根据当前的页数，计算当前所在一级的起始页
                function calculateStart(page) {
                    if (page / 10 != 0) {
                        scope.start = Math.floor(page / 5) * scope.paginationLength + 1;
                    } else {//整十的数
                        scope.start = (page / 5 - 1) * scope.paginationLength + 1;
                    }
                }

                //让外部可以调用内部搜索函数
                scope.$watch('execSearch', function (newValue, oldValue) {
                    if (newValue) {
//						scope.currentPage = 1;
                        calculateStart(scope.currentPage);
                        scope.search();
                    }
                    scope.execSearch = false;

                });
                /**
                 * 点击末页后,确定末页所在一级的起始页号
                 * 例如:
                 * 末页5、10、20、30,则当前所在一级的起始页号为1、6、16、26
                 * 末页4、8、16、22,则当前所在一级的起始页号为1、6、16、21
                 */
                function startPosition() {
                    var c = scope.maxPage % scope.paginationLength;
                    if (c >= 1 && c <= 4) {
                        scope.start = scope.paginationLength * Math.floor(scope.maxPage / scope.paginationLength) + 1;
                    } else {
                        scope.start = scope.paginationLength * Math.floor((scope.maxPage - 1) / scope.paginationLength) + 1;
                    }
                }

                /**
                 * 选页(直接到某一页、首页、末页),已经是当前页则不跳转,更新当前页后ajax请求数据
                 * @param number 要跳转的页号
                 */
                scope.selectPage = function (number) {
                    if (scope.currentPage == number) return;
                    scope.currentPage = number;
                    //若为首页或末页则重新确定所在一级的起始页号
                    if (1 == number) { //首页
                        scope.start = 1;
                    } else if (scope.maxPage == number) { //末页
                        startPosition();
                    }
//                    scope.search();
                    $rootScope.$state.go('app.articles.article_list',{page:parseInt(scope.currentPage)});
                }
                /**
                 * 上一页,当前页没有上页时不跳转,翻页够一级后确定所在一级的起始编号
                 * scope.start=1、6、11、16、21、26...
                 * @param number 要上翻的页号
                 */
                scope.previousPage = function (number) {
                    if (scope.currentPage <= 1) return;
                    scope.selectPage(number);
                    if (number % scope.paginationLength == 0 && number > 0) {
                        scope.start -= scope.paginationLength;
                    }
                }
                /**
                 * 下一页,当前页已为最大页时不跳转,翻页够一级后确定所在一级的起始编号
                 * scope.start=1、6、11、16、21、26...
                 * @param number 要下翻的页号
                 */
                scope.nextPage = function (number) {
                    if (scope.currentPage >= scope.maxPage) return;
                    scope.selectPage(number);
                    if (scope.maxPage != number && number % scope.paginationLength == 1 && number > 0) {
                        scope.start += scope.paginationLength;
                    }
                }
                /**
                 * 上一级,每次减少一个分页长度直到为1且确定当前级的最后一个按钮为当前页
                 */
                scope.previousStage = function () {
                    if (1 < scope.start) {
                        scope.start -= scope.paginationLength;
                    } else {
                        scope.start = 1;
                    }
                    scope.currentPage = scope.start + scope.paginationLength - 1;
//                    scope.search();
                }
                /**
                 * 下一级,每次增加一个分页长度且确定当前级的第一个按钮为当前页
                 */
                scope.nextStage = function () {
                    scope.start += scope.paginationLength;
                    scope.currentPage = scope.start;
//                    scope.search();
                }
                /**
                 * 隐藏或显示下一级按钮,当达到最大页所在一级时隐藏
                 * @returns {boolean} 隐藏为true,显示为false
                 */
                scope.nextStageHide = function () {
                    if (scope.start + scope.paginationLength > scope.maxPage) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }

    })
/**
 * simditor
 */
    .directive('textEditor', ['$rootScope','$timeout',function ($rootScope,$timeout) {
        return {
            restrict: 'AE',
            scope: {
                op: '=',
                data: '=',
                operate: '&',
                category: '=',
                result: '='
            },
            templateUrl: 'tpls/partials/simditor.html',
            link: function (scope, element, attrs) {
                var editor = new Simditor({
                    textarea: element.find('#editor'),
                    toolbarFloat: true,
                    defaultImage:'/images/default.jpg',
                    upload:{
                        url:'/article/img_upload',
                        params:null,
                        fileKey:'upload_file',
                        connectionCount:3,
                        leaveConfirm:'正在上传文件，请勿离开'
                    }
                })
                //编辑文章传入文章内容
                scope.$watch('data.content', function (newValue, oldValue) {
                    if (newValue && newValue.length > 0) {
                        element.find('.simditor-body')[0].innerHTML = newValue;
                    }
                });
                scope.$watch('data.title', function (newValue, oldValue) {
                    if (newValue && newValue.length > 0) {
                        element.find('#title')[0].value = newValue;
                    }
                });
                //用户在发表或更新成功后置空内容
                var timerSuccess;
                scope.$watch('result', function (newValue, oldValue) {
                    if (newValue) {
                        element.find('.simditor-body')[0].innerHTML = element.find('#title')[0].value='';
                        scope.data.title = scope.data.category = null;
                        scope.success='文章发表成功';
                        timerSuccess=$timeout(function(){scope.success='';},1500);
                        scope.result = false;
                    }
                });
                var timerError;
                this.submit = function (op) {
                    scope.$apply(function(){scope.error=''});
                    if(!element.find('#title')[0].value || !element.find('#title')[0].value.trim()){
                        scope.$apply(function(){scope.error='标题不能为空'});
                    }else if(!scope.data.category || !scope.data.category.trim()){
                        scope.$apply(function(){scope.error='分类不能为空'});
                    }else if(element.find('.simditor-body')[0].innerHTML=='<p><br></p>' || !element.find('.simditor-body')[0].innerHTML.trim()){
                        scope.$apply(function(){scope.error='内容不能为空'});
                    }else{
                        !scope.error && scope.operate({
                            op:op,
                            content: element.find('.simditor-body')[0].innerHTML,
                            title: element.find('#title')[0].value,
                            category: scope.data.category
                        });
                    }
                    timerError=$timeout(function(){scope.error='';},1500);
                }
                $rootScope.$on('publish',function(event){
                    this.submit(1);
                });
                $rootScope.$on('update',function(event){
                    this.submit(0);
                });
                window.scrollTo(0, 0);
                scope.$on('$destroy',function(event){
                    $timeout.cancel(timerSuccess);
                    $timeout.cancel(timerError);
                });
            }
        }
    }])
/**
 * 登录界面
 */
    .directive('loginInterface', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                login: '=',
                logout: '=',
                response: '=',
                signIn: '&',
                signOut: '&',
                forgetPwd: '&',
                username: '=',
                password: '='
            },
            templateUrl: 'tpls/partials/login.html',
            link: function (scope, element, attrs) {
                scope.error = "blog-error";
                scope.errorInfo;
                //登录操作后返回的数据，涉及到使用提示信息
                scope.$watch('login', function (newValue, oldValue) {
                    if (200 == newValue.status) {
                        scope.return();
                        scope.username = "";
                        scope.password = "";
                        clearInterval($rootScope.head2Interval);
                        $timeout(function () {
                            var leftPosition = 493;
                            var rightPosition = 80;
                            $rootScope.head1Interval = setInterval(function () {
                                if (leftPosition >= 360) {
                                    leftPosition -= 3;
                                }
                                if (rightPosition <= 285) {
                                    rightPosition += 6;
                                } else {
                                    element.find('.head-circle').css('display', 'inline-block');
                                    element.find('.head-panel').css('display', 'inline-block');
                                    return;
                                }
                                element.find('.head').css('left', leftPosition + 'px').css('width', rightPosition + 'px');
                            }, 20);
                        }, 1000);
                    } else {
                        scope.errorInfo = newValue.message;
                        scope.error = "blog-error";
                        $timeout(function () {
                            scope.errorInfo = "";
                        }, 2000);
                    }
//                    scope.login=false;
                });
                //退出操作后返回的数据，涉及到使用提示信息
                scope.$watch('logout', function (newValue, oldValue) {
                    if (200 == newValue.status) {
                        clearInterval($rootScope.head1Interval);
                        $timeout(function () {
                            var leftPosition = 388;//358px
                            var rightPosition = 290;//290px
                            element.find('.head-panel').css('display', 'none');
                            element.find('.head-circle').css('display', 'block');
                            $rootScope.user = null;
                            $rootScope.head2Interval = setInterval(function () {
                                if (leftPosition < 493) {
                                    leftPosition += 3;
                                } else {
                                    leftPosition = 493;
                                }
                                if (rightPosition > 80) {
                                    rightPosition -= 6;
                                } else {
                                    rightPosition = 80;
                                    return;
                                }
                                element.find('.head').css('left', leftPosition + 'px').css('width', rightPosition + 'px');
                            }, 20);
                        }, 1000);
                    } else {
                        scope.errorInfo = newValue.message;
                        scope.error = "blog-error";
                        $timeout(function () {
                            scope.errorInfo = "";
                        }, 2000);
                    }
                });
                //监视密码重置链接的返回值
                scope.$watch('response', function (newValue, oldValue) {
                    if (newValue) {
                        scope.errorInfo = scope.response.message;
                        scope.error = (scope.response.status == 200 ? "blog-success" : "blog-error");
                        $timeout(function () {
                            scope.errorInfo = "";
                        }, 2000);
                    }
                });
                //如果用户登录则展开头像
                scope.$watch('$rootScope.user', function (newValue, oldValue) {
                    console.log(newValue)
                    if (!$rootScope.user || !$rootScope.user._id) {
                        element.find('.head').css('left', '493px').css('width', '80px');
                        element.find('.head-circle').css('display', 'block');
                        element.find('.head-panel').css('display', 'none');
                    } else {
                        element.find('.head').css('left', '388px').css('width', '290px');
                        element.find('.head-circle').css('display', 'inline-block');
                        element.find('.head-panel').css('display', 'inline-block');
                    }
                });
                //控制密码显隐
                scope.pwd = "password";
                scope.eyeIcon = "glyphicon-eye-open";
                scope.mention = "显示密码";
                scope.eye = function () {
                    if (scope.pwd == "password") {
                        scope.pwd = "text"
                        scope.eyeIcon = "glyphicon-eye-close";
                        scope.mention = "隐藏密码";
                    } else {
                        scope.pwd = "password"
                        scope.eyeIcon = "glyphicon-eye-open";
                        scope.mention = "显示密码";
                    }
                }
                scope.turnToLogin=false;
                var isPasswordPage=false;//当处于重置密码页时，控制当前页不可登录
                //让头像翻转到登录框
                scope.transform = function () {
                    if(isPasswordPage)return;
                    scope.turnToLogin=true;
                    scope.turnToHead=false;
                    if ($rootScope.user)
                        return;
                    var start = 0;
                    var end = 180;
                    clearInterval($rootScope.returnInterval);
                    $rootScope.loginInterval = setInterval(function () {
                        if (end == start + 1) {
                            element.find('.login-gui').css('-webkit-transform', 'rotateX(180deg)');
                            return;
                        }
                        if (start > 10) {
                            element.find('.login-gui li:first-child div').css('display', 'none');
                            element.find('.login-gui li:last-child').css('display', 'inline-block');
                        }
                        var speed = Math.round((end - start) * 0.3);
                        element.find('.login-gui').css('-webkit-transform', 'rotateX(' + (start + speed) + 'deg)');
                        start += speed;
                    }, 100);
                }
                scope.turnToHead=false;
                //让登录框翻转到头像
                scope.return = function () {
                    scope.turnToLogin=false;
                    scope.turnToHead=true;
                    clearInterval($rootScope.loginInterval);
                    var start = 180;
                    var end = 360;
                    $rootScope.returnInterval = setInterval(function () {
                        if (end == start + 1) {
                            element.find('.login-gui').css('-webkit-transform', 'rotateX(360deg)');
                            return;
                        }
                        if (start > 270) {
                            element.find('.login-gui li:first-child div').css('display', 'inline-block');
                            element.find('.login-gui li:last-child').css('display', 'none');
                        }
                        var speed = Math.round((end - start) * 0.3);
                        element.find('.login-gui').css('-webkit-transform', 'rotateX(' + (start + speed) + 'deg)');
                        start += speed;
                    }, 100);
                }
                $rootScope.$on('$stateChangeSuccess',function(){
                    if($rootScope.$state.is('app.user.password')){
                        isPasswordPage=true;
                        if(!scope.turnToHead){
                            scope.return();
                        }
                    }else{
                        isPasswordPage=false;
                    }
                });
            }
        };
    }])
/**
 * 右边工具栏
 */
    .directive('rightSideToolBar', ['$rootScope','getSpecificArticle','PublishOrUpdate', function ($rootScope,getSpecificArticle,PublishOrUpdate) {
        return {
            restrict: 'AE',
            scope: {},
            template: '<ul class="right-side-bar" id="rightSideBar">' +
                        '<li id="previousArticle" class="toolbar-no-hover"></li>' +
                        '<li id="nextArticle" class="toolbar-no-hover"></li>' +
                        '<li id="publish" class="toolbar-no-hover"></li>'+
                        '<li id="update" class="toolbar-no-hover"></li>'+
                        '<li id="goToTop" class="toolbar-top-no-hover"></li>' +
                      '</ul>',
            link: function (scope, element, attrs) {
                angular.element(window).scroll(function () {
                    var s = angular.element(window).scrollTop();
                    if (s > this.minHeight) {
                        angular.element("#goToTop").fadeIn(100);
                    } else {
                        angular.element("#goToTop").fadeOut(200);
                    }
                });
                this.minHeight = 100;//工具栏的定位高度
                //回到顶部
                element.find("#goToTop").click(function () {
                    angular.element("html,body").animate({scrollTop: 0}, 700);
                }).hover(function () {
                    element.find("#goToTop").removeClass("toolbar-top-no-hover").addClass("toolbar-top-hover glyphicon glyphicon-chevron-up");
                }, function () {
                    element.find("#goToTop").removeClass("toolbar-top-hover glyphicon glyphicon-chevron-up").addClass("toolbar-top-no-hover");
                });
                //控制上一篇和下一篇按钮的显隐
                $rootScope.$on('turnPage',function(event,data){
                    if(data.end==-1){
                        element.find("#nextArticle").fadeOut(200);
                    }else if(data.end==1){
                        element.find("#previousArticle").fadeOut(200);
                    }
                });
                //新建文章
                element.find("#publish").click(function(){
                    PublishOrUpdate.publish();
                }).hover(function () {
                    element.find(this).addClass("toolbar-hover glyphicon glyphicon-floppy-disk").removeClass("toolbar-no-hover");
                }, function () {
                    element.find(this).removeClass("toolbar-hover glyphicon glyphicon-floppy-disk").addClass("toolbar-no-hover");
                });
                //更新文章
                element.find("#update").click(function(){
                    PublishOrUpdate.update();
                }).hover(function () {
                    element.find(this).addClass("toolbar-hover glyphicon glyphicon-retweet").removeClass("toolbar-no-hover");
                }, function () {
                    element.find(this).removeClass("toolbar-hover glyphicon glyphicon-retweet").addClass("toolbar-no-hover");
                });
                //上一篇
                element.find("#previousArticle").click(function(){
                    getSpecificArticle(true);
                }).hover(function () {
                    element.find(this).addClass("toolbar-hover glyphicon glyphicon-chevron-left").removeClass("toolbar-no-hover");
                }, function () {
                    element.find(this).removeClass("toolbar-hover glyphicon glyphicon-chevron-left").addClass("toolbar-no-hover");
                });
                //下一篇
                element.find("#nextArticle").click(function(){
                    getSpecificArticle(false);
                }).hover(function () {
                    element.find(this).addClass("toolbar-hover glyphicon glyphicon-chevron-right").removeClass("toolbar-no-hover");
                }, function () {
                    element.find(this).removeClass("toolbar-hover glyphicon glyphicon-chevron-right").addClass("toolbar-no-hover");
                });
                //监视当前路由是否为文章详情页的路由
                if ($rootScope.$state.is('app.articles.article_detail')) {
                    element.find("#previousArticle,#nextArticle").fadeIn(100);
                } else {
                    element.find("#previousArticle,#nextArticle").fadeOut(200);
                }
                if ($rootScope.$state.is('app.articles.edit') && $rootScope.$stateParams.id==-1) {//新建文章
                    element.find("#publish").fadeIn(100);
                } else {
                    element.find("#publish").fadeOut(200);
                }
                if($rootScope.$state.is('app.articles.edit') && $rootScope.$stateParams.id.length==24){
                    element.find("#update").fadeIn(100);
                }else{
                    element.find("#update").fadeOut(100);
                }
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    if ($rootScope.$state.is('app.articles.article_detail')) {
                        element.find("#previousArticle,#nextArticle").fadeIn(100);
                    } else {
                        element.find("#previousArticle,#nextArticle").fadeOut(200);
                    }
                    if ($rootScope.$state.is('app.articles.edit') && $rootScope.$stateParams.id==-1) {//新建文章
                        element.find("#publish").fadeIn(100);
                    } else {
                        element.find("#publish").fadeOut(200);
                    }
                    if($rootScope.$state.is('app.articles.edit') && $rootScope.$stateParams.id.length==24){
                        element.find("#update").fadeIn(100);
                    }else{
                        element.find("#update").fadeOut(100);
                    }
                });
            }
        }
    }]);