/*
 * AngularJS UI for django BMF
 */


var app = angular.module('djangoBMF', []);


/*
 * Config
 */


app.config(['$httpProvider', '$locationProvider', function($httpProvider, $locationProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $locationProvider.html5Mode(true).hashPrefix('!');
}]);


/*
 * Directives
 */

// manages form modal calls
app.directive('bmfForm', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {

            element.on('click', function(event) {
                event.preventDefault();
                open_formular(this, element);
            });

            var initialize_modal = function () {
                // initialize the modal
                $('#wrap').prepend('<div class="modal fade" id="bmfmodal_edit" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal-lg"></div></div>');
                $('#bmfmodal_edit').modal({
                    keyboard: true,
                    show: false,
                    backdrop: 'static'
                });

                // delete the modals content, if closed
                $('#bmfmodal_edit').on('hidden.bs.modal', function (e) {
                    $('#bmfmodal_edit div.modal-dialog').empty();
                });

                //// reload the page if one save has appeared
                //$('#bmfmodal_edit').on('hide.bs.modal', function (e) {
                //    if ($('#bmfmodal_edit > div.page-reload').length == 1) {
                //        location.reload(false);
                //    }
                //});
            }

            var open_formular = function (clicked, element) {
                // loads the formular data into the modal
                if ($('#bmfmodal_edit').length == 0) { initialize_modal() }

                var dict = $.bmf.AJAX;
                dict.type = "GET";
                dict.url = element[0].href;
                $.ajax(dict).done(function( data, textStatus, jqXHR ) {

                    if (data.success == true && data.reload == true) {
                        // reload page without refreshing the cache
                        location.reload(false);
                        return null;
                    }

                    $('#bmfmodal_edit div.modal-dialog').prepend(data.html);
                    $('#bmfmodal_edit').modal('show');

                    // manipulate form url
                    // cause the template-tag which generates the form is not aware of the url
                    var parent_object = $('#bmfmodal_edit div.modal-dialog div:first-child');
                    var form_object = parent_object.find('form');
                    // form_object.attr('action', base.options.href.split("?",1)[0]);
                    form_object.attr('action', dict.url);
                    // apply bmf-form functions
                    form_object.bmf_buildform();

                    parent_object.find('button.bmfedit-cancel').click(function (event) {
                        // TODO check if there are multile forms and close modal or show next form
                        $('#bmfmodal_edit').modal('hide');
                    });

                    parent_object.find('button.bmfedit-submit').click(function (event) {
                        dict = $.bmf.AJAX;
                        dict.type = "POST";
                        dict.data = form_object.serialize();
                        dict.url = form_object.attr('action');
                        $.ajax(dict).done(function( data, textStatus, jqXHR ) {

                            //  # if an object is created or changed return the object's pk on success
                            //  'object_pk': 0, TODO
                            //  # on success set this to True
                            //  'success': False,
                            //  # reload page on success
                            //  'reload': False,
                            //  # OR redirect on success
                            //  'redirect': None,
                            //
                            //  # OR reload messages on success
                            //  'message': False, # TODO
                            //  # returned html
                            //  'html': None, # TODO
                            //  # return error messages
                            //  'errors': [], TODO

                            if (data.success == false) {
                                html = $($.parseHTML( data.html ));
                                form_object.html(html.find('form').html());
                                form_object.bmf_buildform();
                            }
                            else if (data.reload == true) {
                                // reload page without refreshing the cache
                                location.reload(false);
                            }
                            else if (data.redirect != null) {
                                window.location.href=data.redirect;
                            }
                            else {
                                $('#bmfmodal_edit').modal('hide');
                            }
                        });
                    });
                });
            }
        }
    };
}]);


// manages the content-area
app.directive('bmfContent', ['$compile', function($compile) {
    return {
        restrict: 'A',
        priority: -90,
        link: function(scope, $element) {
            scope.watcher = undefined

            scope.$watch(
                function(scope) {
                    if (scope.bmf_current_view) {
                        return scope.bmf_current_view.type
                    }
                    return undefined
                },
                function(newValue) {if (newValue != undefined) update(newValue)}
            );

            function update(type) {
                $element.html(scope.bmf_templates[type]).show();
                $compile($element.contents())(scope);
            }
        }
    };
}]);

// manages the list view
app.directive('bmfViewList', ['$compile', '$http', function($compile, $http) {
    return {
        restrict: 'A',
        priority: -80,
        link: function(scope, $element) {
            if (scope.watcher != undefined) {
                scope.watcher();
            }
            scope.watcher = scope.$watch(
                function(scope) {return scope.bmf_current_view},
                function(newValue) {if (newValue != undefined && newValue.type == "list") update(newValue)}
            );

            function update(view) {
                // cleanup
                $element.html("");
                scope.data = [];
                scope.pagination = undefined;

                // update vars
                scope.view_name = view.view.name;
                scope.category_name = view.category.name;
                scope.dashboard_name = view.dashboard.name;

                // get new template
                $http.get(view.view.api).then(function(response) {

                    var ct = response.data.ct;
                    var module = scope.$parent.bmf_modules[ct];

                    scope.creates = module.creates;
                    $element.html(response.data.html).show();
                    $compile($element.contents())(scope);

                    // get new data
                    var url = module.api + '?d=' + view.dashboard.key + '&c=' + view.category.key + '&v=' + view.view.key;

                    $http.get(url).then(function(response) {
                    //  if (scope.bmf_debug) {
                    //      console.log("LIST-DATA", url, response.data)
                    //  }

                        scope.data = response.data.items;
                        scope.pagination = response.data.pagination;
                    });
                });
            }
        }
    };
}]);


// manages the list view
app.directive('bmfViewDetail', ['$compile', '$http', '$location', function($compile, $http, $location) {
    return {
        restrict: 'A',
        priority: -80,
        link: function(scope, $element) {
            if (scope.watcher != undefined) {
                scope.watcher();
            }
            scope.watcher = scope.$watch(
                function(scope) {return scope.bmf_current_view},
                function(newValue) {if (newValue != undefined && newValue.type == "detail") update(newValue)}
            );
  
            function update(view) {
                var url = $location.path();
                // cleanup
//              $element.html("");
//              scope.data = [];
//              scope.pagination = undefined;
//
//              // update vars
//              scope.view_name = view.view.name;
//              scope.category_name = view.category.name;
//              scope.dashboard_name = view.dashboard.name;
//
                // get new template
                $http.get(url).then(function(response) {
                    console.log(response);
//
//                  var ct = response.data.ct;
//                  var module = scope.$parent.bmf_modules[ct];
//
//                  scope.creates = module.creates;
//                  $element.html(response.data.html).show();
//                  $compile($element.contents())(scope);
//
//                  if (scope.bmf_debug) {
//                      console.log("LIST-SCOPE", scope)
//                  }
//
//                  // get new data
//                  var url = module.api + '?d=' + view.dashboard.key + '&c=' + view.category.key + '&v=' + view.view.key;
//
//                  $http.get(url).then(function(response) {
//                      if (scope.bmf_debug) {
//                          console.log("LIST-DATA", url, response.data)
//                      }
//
//                      scope.data = response.data.items;
//                      scope.pagination = response.data.pagination;
//                  });
                });
            }
        }
    };
}]);


/*
 * Services
 */


app.factory('CurrentView', ['$rootScope', '$location', 'PageTitle', function($rootScope, $location, PageTitle) {
    function go(next) {
        $rootScope.bmf_current_view = next;
        if (next && next.type == "list") {
            PageTitle.set(next.dashboard.name + ' - ' + next.category.name + ' - ' + next.view.name);
            $rootScope.bmf_current_dashboard = {
                key: next.dashboard.key,
                name: next.dashboard.name
            };
        }
    }

    function update(url, prefix) {
        var current = get(url, prefix);
        go(current);
        return current
    }

    function get(url, prefix) {
        if (url == undefined) {
            url = $location.path();
        }
        if (prefix) {
            if ($location.protocol() == 'http' && $location.port() == 80) {
                prefix = 'http://'+ $location.host();
            }
            else if ($location.protocol() == 'https' && $location.port() == 443) {
                prefix = 'https://'+ $location.host();
            }
            else {
                prefix = $location.protocol() + '://' + $location.host() + ':' + $location.port()
            }
        }
        else {
            prefix = ''
        }
        var current = undefined;

        // LIST
        $rootScope.bmf_dashboards.forEach(function(d, di) {
            d.categories.forEach(function(c, ci) {
                c.views.forEach(function(v, vi) {
                    if (prefix + v.url == url) {
                        current = {
                            type: 'list',
                            view: v,
                            category: c,
                            dashboard: d,
                        };
                    }
                });
            });
        });
        if (current) {
            return current;
        }

//      // DETAIL
//      for (var key in $rootScope.bmf_modules) {
//          var module = $rootScope.bmf_modules[key];
//          var regex = new RegExp('^' + prefix + module.url + '[0-9]+/$');
//          if (regex.test(url)) {
//              current = {
//                  type: 'detail',
//                  module: module,
//              };
//          }
//      }
//      if (current) {
//          return current;
//      }

        return current
    }
    return {get: get, go: go, update: update}
}]);

app.factory('PageTitle', function() {
    var title = '';
    return {
        get: function() { return title; },
        set: function(newTitle) { title = newTitle }
    };
});


/*
 * Controller
 */


// this controller is evaluated first, it gets all
// the data needed to access the bmf's views
app.controller('FrameworkCtrl', ['$http', '$rootScope', '$scope', '$window', 'CurrentView', 'PageTitle', function($http, $rootScope, $scope, $window, CurrentView, PageTitle) {

    // pace to store basic templates
    $rootScope.bmf_templates = {
        // template used to display items from the data api as a list
        'list': '',
    };

    // place to store all dashboards
    $rootScope.PageTitle = PageTitle;

    // place to store all dashboards
    $rootScope.bmf_dashboards = undefined;

    // place to store all sitemaps
    $rootScope.bmf_sidebars = undefined;

    // place to store all sitemaps
    $rootScope.bmf_modules = undefined;

    // holds the current dashboard
    $rootScope.bmf_current_dashboard = undefined;

    // holds all informations about the current view
    $rootScope.bmf_current_view = undefined

    // data holder
    $rootScope.bmf_data = undefined;

    // Load data from REST API
    var url = angular.element.find('body')[0].dataset.api;
    $http.get(url).then(function(response) {

        // Update sidebar and Dashboard objects
        var sidebar = {}
        response.data.dashboards.forEach(function(element, index) {
            sidebar[element.key] = element.categories;
        });

        var modules = {}
        response.data.modules.forEach(function(element, index) {
            modules[element.ct] = element;
        });

        $rootScope.bmf_modules = modules;
        $rootScope.bmf_sidebars = sidebar;

        $rootScope.bmf_dashboards = response.data.dashboards;
        $rootScope.bmf_debug = response.data.debug;
        $rootScope.bmf_templates = response.data.templates;

        if (response.data.debug) {
            console.log("BMF-API", response.data);
        }

        CurrentView.update();
    });

    $scope.$on('$locationChangeStart', function(event, next, current) {
        // only invoke if dashboards are present (and the ui is loaded propperly)
        if ($rootScope.bmf_dashboards) {
            var next_view = CurrentView.get(next, true);
            if (next_view) {
                CurrentView.go(next_view);
                return true
            };
        }

        // Case when the target url is not managed by the ui
        event.preventDefault(true);
        if (next != current) {
            $window.location = next;
        }
    });
}]);

// This controller updates the dashboard dropdown menu
app.controller('DashboardCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {

    $scope.data = [];
    $scope.current_dashboard = null;

    $scope.$watch(
        function(scope) {return scope.bmf_dashboards},
        function(newValue) {if (newValue != undefined) update_dashboard()}
    );
    $scope.$watch(
        function(scope) {return scope.bmf_current_dashboard},
        function(newValue) {if (newValue != undefined) update_dashboard()}
    );

    function update_dashboard(key) {
        var response = [];
        var current_dashboard = [];
        var current = $scope.bmf_current_dashboard;

        $scope.bmf_dashboards.forEach(function(d, di) {
            var active = false
            if (current && current.key == d.key || key && key == d.key) {
                active = true
            }

            response.push({
                'key': d.key,
                'name': d.name,
                'active': active,
            });
        });

        $scope.data = response;
        $scope.current_dashboard = $scope.bmf_current_dashboard;

    }

    $scope.update = function(key) {
        var name;
        $scope.bmf_dashboards.forEach(function(d, di) {
            if (key && key == d.key) {
                name = d.name;
            }
        });

        if (name) {
            $rootScope.bmf_current_dashboard = {
                key: key,
                name: name
            };
        }
        else {
            $rootScope.bmf_current_dashboard = undefined;
        }
    };

}]);

// This controller updates the dashboard dropdown menu
app.controller('SidebarCtrl', ['$scope', function($scope) {
    $scope.data = [];

    $scope.$watch(
        function(scope) {return scope.bmf_current_view},
        function(newValue) {if (newValue != undefined && newValue.type == "list") update_sidebar()}
    );
    $scope.$watch(
        function(scope) {return scope.bmf_current_dashboard},
        function(newValue) {if (newValue != undefined) update_sidebar()}
    );

    function update_sidebar() {
        var response = [];
        var key = $scope.bmf_current_dashboard.key;

        response.push({
            'class': 'sidebar-board',
            'name': $scope.bmf_current_dashboard.name
        });

        $scope.bmf_sidebars[key].forEach(function(c, ci) {
            response.push({'name': c.name});
            c.views.forEach(function(v, vi) {
                if ($scope.bmf_current_view && $scope.bmf_current_view.type == "list" && c.key == $scope.bmf_current_view.category.key && v.key == $scope.bmf_current_view.view.key) {
                    response.push({'name': v.name, 'url': v.url, 'class': 'active'});
                }
                else {
                    response.push({'name': v.name, 'url': v.url});
                }
            });
        });

        $scope.data = response;
    }
}]);