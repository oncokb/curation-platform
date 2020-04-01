// Generated on 2014-10-07 using generator-angular 0.9.8
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var sass = require('node-sass');
    var serveStatic = require('serve-static');

    // Configurable paths for the application
    var appConfig = {
        app: 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        oncokb: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= oncokb.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:eslint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            sass: {
                files: ['<%= oncokb.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass', 'postcss']
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:eslint:test', 'karma']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= oncokb.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= oncokb.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            serveStatic('.tmp'),
                            connect().use(
                                '<%= oncokb.app %>/components',
                                serveStatic('<%= oncokb.app %>/components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            serveStatic('.tmp'),
                            serveStatic('test'),
                            connect().use(
                                '<%= oncokb.app %>/components',
                                serveStatic('<%= oncokb.app %>/components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= oncokb.dist %>'
                }
            }
        },

        eslint: {
            target: [
                'Gruntfile.js',
                '<%= oncokb.app %>/scripts/{,*/}*.js',
                'test/spec/{,*/}*.js'
            ],
            options: {
                quiet: true
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= oncokb.dist %>/{,*/}*',
                        '!<%= oncokb.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({browsers: 'last 2 versions'}) // add vendor prefixes
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                implementation: sass,
                sourcemap: true
            },
            dist: {
                files: {
                    '.tmp/styles/main.css': '<%= oncokb.app %>/styles/main.scss'
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= oncokb.dist %>/scripts/{,*/}*.js',
                    '<%= oncokb.dist %>/styles/{,*/}*.css',
                    '<%= oncokb.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= oncokb.app %>/index.html',
            options: {
                dest: '<%= oncokb.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= oncokb.dist %>/{,*/}*.html'],
            css: ['<%= oncokb.dist %>/styles/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= oncokb.dist %>', '<%= oncokb.dist %>/images']
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        cssmin: {
            // dist: {
            //   files: {
            //     '<%= oncokb.dist %>/styles/main.css': [
            //       '.tmp/styles/{,*/}*.css'
            //     ]
            //   }
            // }
        },
        uglify: {
            dist: {
                options: {
                    mangle: {
                        reserved: ['oncokb']
                    }
                },
                files: [{
                    expand: true,
                    src: ['<%= oncokb.dist %>/scripts/common.js', '<%= oncokb.dist %>/scripts/pleaseWait.js'],
                    dest: '<%= oncokb.dist %>/scripts/',
                    cwd: '.',
                    rename: function (dst, src) {
                        // To keep the source js files and make new files as `*.min.js`:
                        // return dst + '/' + src.replace('.js', '.min.js');
                        // Or to override to src:
                        return src;
                    }
                }]
            }
        },
        concat: {
            // dist: {
            //   src: ['<%= oncokb.dist %>/scripts/**/**.js'],
            //   dest: 'dist/controllers.js'
            // }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= oncokb.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= oncokb.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= oncokb.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= oncokb.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= oncokb.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= oncokb.dist %>'
                }]
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: ['*.js', '!oldieshim.js'],
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= oncokb.app %>',
                    dest: '<%= oncokb.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/styles',
                    dest: '<%= oncokb.app %>/styles',
                    src: ['main.css']
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= oncokb.dist %>/images',
                    src: ['generated/*']
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/components/',
                    src: ['bootstrap-sass-official/assets/fonts/bootstrap/*', 'fontawesome/fonts/*'],
                    dest: '<%= oncokb.dist %>/fonts',
                    flatten: true
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/',
                    src: 'components/bootstrap-sass-official/assets/fonts/bootstrap/*',
                    dest: '<%= oncokb.dist %>'
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/',
                    src: 'components/fontawesome/fonts/*',
                    dest: '<%= oncokb.dist %>'
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/',
                    src: 'components/bootstrap-chosen/*',
                    dest: '<%= oncokb.dist %>'
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/components/datatables/media/images',
                    src: '*',
                    dest: '<%= oncokb.dist %>/images'
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/components/bootstrap-chosen/',
                    src: ['chosen-sprite.png', 'chosen-sprite@2x.png'],
                    dest: '<%= oncokb.dist %>/styles'
                }, {
                    expand: true,
                    cwd: '<%= oncokb.app %>/',
                    src: ['data/config.json', 'data/isoformMskcc.json', 'data/isoformUniport.json', 'data/oncogeneTSG.json'],
                    dest: '<%= oncokb.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= oncokb.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            dist: [
                'sass',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        // Auto add timestamp to js files
        cachebreaker: {
            dev: {
                options: {
                    match: ['/*.js', '/*.css']
                },
                files: {
                    src: ['<%= oncokb.app %>/index.html']
                }
            }
        }
    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'sass',
            'postcss',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'test'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare:html',
        'concurrent:dist',
        'postcss',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'cssmin',
        'uglify:dist',
        'filerev',
        'usemin'
        // 'htmlmin',
        // 'cachebreaker:dev'
    ]);

    grunt.registerTask('default', [
        'newer:eslint',
        'test',
        'build'
    ]);

    grunt.registerTask('jsVersion', [
        'cachebreaker:dev'
    ]);
};
