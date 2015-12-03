/*
* Feed Directive
* */

angular.module('feeder', [])
    .directive('feed',['$compile','$http','$sce','$templateCache','feedCache',function($compile,$http,$sce,$templateCache,feedCache){
    return {
        restrict: 'E',
        scope: {
            url: '@',
            summary: '@',
            count: '@',
            noResultText: '@'
        },
        templateUrl: 'views/partials/feed_landing.html',
        link: function(scope, element, attrs){

            var templateHtml;

            scope.feeds = [];
            var params = {};

            if(scope.url){
                params.url = scope.url;
            }

            if(scope.count){
                params.count = scope.count;
            }

            if(scope.summary){
                params.summary = scope.summary;
            }

            function getImageUrl (content){
                var regex = /<img.*?src="(.*?)"/;
                imageUrl = regex.exec(content);
                if(imageUrl){
                    return imageUrl[1];
                }else{
                    return '';
                }

            };

            if (feedCache.hasCache(scope.url)) {
                var feeds = feedCache.get(scope.url);
                templateHtml = $templateCache.get(attrs.feedTemplateUrl);
                renderTemplate(templateHtml[1],feeds);

            }
            else {
                return $http({
                    method: 'GET',
                    url : '/api/feeds',
                    params: params
                }).then(function(response){
                    templateHtml = $templateCache.get(attrs.feedTemplateUrl);
                    renderTemplate(templateHtml[1], response.data);
                }).catch(function(err){
                    var noResultHtml = "<div>{{ noResultText }}</div>";
                    renderTemplate(noResultHtml, null);
                });
            }



            function sanitizeFeedEntry(feedEntry) {
                feedEntry.title = $sce.trustAsHtml(feedEntry.title);
                feedEntry.description = $sce.trustAsHtml(feedEntry.description);
                feedEntry.summary = $sce.trustAsHtml(feedEntry.summary);
                feedEntry.publishedDate = new Date(feedEntry.publishedDate).getTime();
                feedEntry.image = getImageUrl(feedEntry.description);
                console.log(feedEntry.image);
                return feedEntry;
            }

            function renderTemplate(templateHTML, feedsObj) {
                element.replaceWith($compile(templateHTML)(scope));
                if (feedsObj) {
                    for (var i = 0; i < feedsObj.length; i++) {
                        scope.feeds.push(sanitizeFeedEntry(feedsObj[i]));
                    }
                }
            }

        }
    };

}]).factory('feedCache', function () {
    var CACHE_INTERVAL = 1000 * 60 * 5; //5 minutes

    function cacheTimes() {
        if ('CACHE_TIMES' in localStorage) {
            return angular.fromJson(localStorage.CACHE_TIMES);
        }
        return {};
    }

    function hasCache(name) {
        var CACHE_TIMES = cacheTimes();
        return name in CACHE_TIMES && name in localStorage && new Date().getTime() - CACHE_TIMES[name] < CACHE_INTERVAL;
    }

    return {
        set: function (name, obj) {
            localStorage[name] = angular.toJson(obj);
            var CACHE_TIMES = cacheTimes();
            CACHE_TIMES[name] = new Date().getTime();
            localStorage.CACHE_TIMES = angular.toJson(CACHE_TIMES);
        },
        get: function (name) {
            if (hasCache(name)) {
                return angular.fromJson(localStorage[name]);
            }
            return null;
        },
        hasCache: hasCache
    };
});