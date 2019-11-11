/**
 * Created by yfyuan on 2016/7/19.
 */
cBoard.controller('cBoardCtrl', function ($rootScope, $scope, $location, $http, $q, $filter, $uibModal, ModalUtils) {

    var translate = $filter('translate');  //国际化和本地化转换

    $rootScope.alert = function (msg) {
        ModalUtils.alert(msg);
    };
    //新添加读取cookie函数
    var getCookie = function (name) {
        //获取当前所有cookie
        var strCookies = document.cookie;
        //截取变成cookie数组
        var array = strCookies.split('; ');
        //循环每个cookie
        for (var i = 0; i < array.length; i++) {
            //将cookie截取成两部分
            var item = array[i].split("=");
            //判断cookie的name 是否相等
            if (item[0] == name) {
                return item[1];
            }
        }
        return null;
    }
    //$rootScope.ifView = getCookie('view');
    if(getCookie('view')=="false"){
    	$rootScope.ifNotView = false;
        $scope.ifNotView = false;
    }
    else{
    	$rootScope.ifNotView = true;
        $scope.ifNotView = true;
    }
    $http.get("commons/getUserDetail.do").success(function (response) {
        $scope.user = response;
        $rootScope.user = response;
        var avatarUrl = 'dist/img/user-male-circle-blue-128.png';
        $scope.user.avatar = avatarUrl;
    });

    var getMenuList = function () {
        $http.get("commons/getMenuList.do").success(function (response) {
            $scope.menuList = response;
        });
    };

    var getCategoryList = function () {
        $http.get("dashboard/getCategoryList.do").success(function (response) {
            $scope.categoryList = response;
        });
    };

    var getBoardList = function () {
        $http.get("dashboard/getBoardList.do").success(function (response) {
            $scope.boardList = response;
        });
    };

    $scope.$on("boardChange", function () {
        getBoardList();
    });

    $scope.$on("categoryChange", function () {
        getCategoryList();
    });

    $scope.isShowMenu = function (code) {
        return !_.isUndefined(_.find($scope.menuList, function (menu) {
            return menu.menuCode == code
        }));
    };

    getMenuList();
    getCategoryList();
    getBoardList();

    $scope.changePwd = function () {
        $uibModal.open({
            templateUrl: 'org/cboard/view/cboard/changePwd.html',
            windowTemplateUrl: 'org/cboard/view/util/modal/window.html',
            backdrop: false,
            size: 'sm',
            controller: function ($scope, $uibModalInstance) {
                $scope.close = function () {
                    $uibModalInstance.close();
                };
                $scope.ok = function () {
                    $http.post("commons/changePwd.do", {
                        curPwd: $scope.curPwd,
                        newPwd: $scope.newPwd,
                        cfmPwd: $scope.cfmPwd
                    }).success(function (serviceStatus) {
                        if (serviceStatus.status == '1') {
                            ModalUtils.alert(translate("COMMON.SUCCESS"), "modal-success", "sm");
                            $uibModalInstance.close();
                        } else {
                            ModalUtils.alert(serviceStatus.msg, "modal-warning", "lg");
                        }
                    });
                };
            }
        });
    }
});