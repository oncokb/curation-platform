'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:qtip
 * @description
 * # qtip
 */
angular.module('oncokbApp')
    .directive('qtip', function(DatabaseConnector, $rootScope) {
        return {
            restrict: 'A',
            scope: {
                time: '=',
                by: '=',
                abstracts: '=',
                pmids: '='
            },
            link: function(scope, element, attrs) {
                var src = '';
                var content = '';
                var events;
                var hideEvent = 'mouseleave';
                var my = attrs.hasOwnProperty('my') ? attrs.my : 'bottom center';
                var at = attrs.hasOwnProperty('at') ? attrs.at : 'top center';

                if (attrs.type && ['pmid', 'nct', 'abstract'].indexOf(attrs.type) !== -1) {
                    src = '<iframe width="600px" height="400px" src=\'';
                    if (attrs.type && attrs.number) {
                        switch (attrs.type) {
                        case 'pmid':
                            src += 'https://www.ncbi.nlm.nih.gov/research/pubtator/index.html?view=docsum&query=' + attrs.number;
                            break;
                        case 'nct':
                            src += 'https://clinicaltrials.gov/show/' + attrs.number;
                            break;
                        case 'abstract':
                            src += attrs.number;
                            break;
                        default:
                            break;
                        }
                    }
                    src += '\'></iframe>';
                    content = $(src);
                    hideEvent = 'unfocus';
                    my = 'top left';
                    at = 'bottom right';
                } else if (attrs.type === 'vusItem') {
                    content = '<span>Last edit: ' + new Date(scope.time).toLocaleDateString() + '</span><br/><span>By: ' + scope.by + '</span>';
                } else if (attrs.type === 'map') {
                    content = attrs.content;
                } else if (attrs.type === 'evidence') {
                    content = '<img src="images/loader.gif" />';
                    events = {
                        show: function(event, qtipApi) {
                            var pmids = _.isArray(scope.pmids) ? scope.pmids.map(function(pmid) {
                                return pmid.pmid;
                            }) : [];
                            DatabaseConnector.getPubMedArticle(pmids, function(articles) {
                                var articlesData = articles.result;
                                var content = [];
                                if (attrs.content) {
                                    content.push('<p>' + attrs.content + '</p>');
                                }
                                content.push('<ul class="list-group">');
                                if (articlesData !== undefined && articlesData.uids.length > 0) {
                                    articlesData.uids.forEach(function(uid) {
                                        var articleContent = articlesData[uid];
                                        var li = [];
                                        var subtitle = [];
                                        if (articleContent.title) {
                                            li.push('<a href="https://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + articleContent.title + '</b></a>');
                                        }
                                        if (_.isArray(articleContent.authors) && articleContent.authors.length > 0) {
                                            subtitle.push(articleContent.authors[0].name + ' et al.');
                                        }
                                        if (articleContent.source) {
                                            subtitle.push(articleContent.source + '.');
                                        }
                                        if (articleContent.pubdate) {
                                            subtitle.push((new Date(articleContent.pubdate)).getFullYear());
                                        }
                                        subtitle.push('<span ' + ((subtitle.length > 0 || li.length > 0) ? 'style="float: right"' : '') + '>PMID: <a href="https://www.ncbi.nlm.nih.gov/pubmed/' + uid + '" target="_blank"><b>' + uid + '</b></a></span>');

                                        if (li.length > 0 && subtitle.length > 0) {
                                            subtitle.unshift('<br/>');
                                        }
                                        li.unshift('<li class="list-group-item" style="width: 100%">');
                                        li.push(subtitle.join(' '));
                                        li.push('</li>');

                                        content.push(li.join(''));
                                    });
                                }
                                if (_.isArray(scope.abstracts)) {
                                    _.each(scope.abstracts, function(item) {
                                        content.push('<li class="list-group-item" style="width: 100%">');
                                        if (_.isString(item.link)) {
                                            content.push('<a href="' + item.link + '" target="_blank">');
                                        }
                                        content.push('<b>' + item.abstract + '</b>');
                                        if (_.isString(item.link)) {
                                            content.push('</a>');
                                        }
                                        content.push('</li>');
                                    });
                                }
                                content.push('</ul>');
                                qtipApi.set({
                                    'content.text': '<div style="width: 500px !important; font-size: 14px; line-height: 14px">' + content.join('') + '</div>'
                                });
                                qtipApi.reposition(event, false);
                            }, function() {
                                content = '';
                            });
                        }
                    };
                } else if (attrs.type === 'level') {
                    content = '<img src="resources/images/loader.gif" />';
                    events = {
                        show: function(event, qtipApi) {
                            var content = $rootScope.meta.levelsDescHtml[attrs.number.toString().toUpperCase()] || '';

                            qtipApi.set({
                                'content.text': content,
                                'style.classes': 'qtip-light qtip-shadow'
                            });

                            qtipApi.reposition(event, false);
                        }
                    };
                }

                if (!attrs.type) {
                    hideEvent = 'mouseleave';
                    content = attrs.content;
                }

                var options = {
                    content: content,
                    position: {
                        my: my,
                        at: at,
                        viewport: $(window)
                    },
                    style: {
                        classes: 'qtip-light qtip-rounded'
                    },
                    events: events,
                    show: 'mouseover',
                    hide: {
                        event: hideEvent,
                        fixed: true,
                        delay: 500
                    }
                };

                if (['vusItem', 'map', 'evidence', 'level'].indexOf(attrs.type) !== -1 ||
                    (attrs.number !== undefined && attrs.number.length > 0) || (attrs.content !== undefined && attrs.content.length > 0)) {
                    $(element).qtip(options);
                }

                scope.$watch('time', function(n) {
                    if (n) {
                        if ($(element).data('qtip')) {
                            $(element).qtip('api').set('content.text', '<span>Last edit: ' + new Date(scope.time).toLocaleDateString() + '</span><br/><span>By: ' + scope.by + '</span>');
                        }
                    }
                });
            }
        };
    });
