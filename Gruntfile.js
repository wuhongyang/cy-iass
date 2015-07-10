// Generated on 2014-09-25 using generator-angular 0.9.8
//'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: appConfig,
    banner: '! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> \n'+
      '　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　\n'+
      '　　　　　　　　　　　　　　　　　　　　　　　　　　　　　丶丶亅亅亅丶　　　　　　　　\n'+
      '　　　　　　　　　　　丶乙瓦瓦十丶　　　　　　　　　乙車鬼毋車毋己毋車毋車乙　　　　　\n'+
      '　　　　　　　　　亅日馬馬龠車己瓦乙亅十十十十十乙日鬼鬼日乙己瓦車車毋毋車車亅　　　　\n'+
      '　　　丶丶　　十己鬼馬鬼乙己己日己己日日日日瓦毋日瓦鬼車毋日毋瓦毋馬瓦瓦日毋己　　　　\n'+
      '　　毋龠馬瓦車龠龠車乙　　己己日日毋車毋瓦瓦瓦車瓦毋車龠龍鬼毋毋日日乙亅己毋亅　　　　\n'+
      '　亅龍毋己己己乙亅　　　　己瓦瓦車毋車毋日瓦毋瓦車車鬼鬼瓦馬毋瓦瓦己　　　　　　　　　\n'+
      '　丶丶　　　　　　亅十亅乙瓦毋己毋毋乙毋車瓦毋毋毋車車十十馬車乙瓦車亅　　　　　　　　\n'+
      '　　　　　　　　丶己毋瓦瓦毋日毋車龠十亅己車車毋瓦日乙亅十日鬼毋己己己亅　　　　　　　\n'+
      '　　　　丶日十亅十車瓦瓦日瓦毋車鬼己　　　亅十己瓦日己亅　亅毋鬼瓦日己日己十丶　　　　\n'+
      '　　　　亅毋瓦乙瓦乙丶丶亅日車己丶　　　　　　　　丶　　　　　亅己己十日車鬼己十亅亅丶\n'+
      '　　　　　　己亅丶　　　　　　　　　　　　　　　　　　　　　　　　　　　丶十乙毋日日亅\n'+
      '',
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        ///tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      less : {
                files: ['less/**'],
                tasks: ['less:dev']
            },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      views: {
        files: ['app/views/**','app/head.html','app/footer.html']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      controllermodule:{
                files:['app/scripts/controllers/**'],
                tasks:["concatmodule:controllermodule"],
                options: {
                  event: ['added', 'deleted'],
                }
            }
    },
    concatmodule: {
            
            controllermodule: {
                options: {
                    src: 'app/scripts/controllers/',
                    prefix: './controllers/',
                    dest: 'app/scripts/controllermodule.js'
                }
            },
            
            options: {
                banner: '/** <%= banner %> **/\n'
            }
        },
    // The actual grunt server settings
    connect: {
      options: {
        port: 9001,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35728
      },
      livereload: {
        options: {
          open: false,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/assets',
                connect.static('assets')),
              connect().use(
                '/css',
                connect.static('css')),
              connect().use(
                '/img',
                connect.static('img')),
              connect().use(
                '/js',
                connect.static('js')),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src:'main.css',
          //src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    less: {
            dev: {
                options: {
                    strictImports:false
                },
                files: {
                    'app/styles/main.css' : 'less/app.less'
                }
            }
        },
    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/head.html','<%= yeoman.app %>/footer.html'],
        ignorePath:  /\.\.\//,
        exclude:[/requirejs|echarts|mustache|jquery\.customSelect\.js|jquery\.dataTables\.css/]
      }
    },
    targethtml: {
      options: {
        curlyTags: {
          appname: '<%=pkg.name%>',
          version: '<%=pkg.version%>',
          rlsdate: '<%= grunt.template.today("yyyymmddHHMM") %>',
          rlsdate2: '<%= grunt.template.today("yyyy.mm.dd HH:MM") %>',
          banner: '<!-- <%= banner %> -->'
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: ['**.html'],
          dest: 'dist'
        }]
      }
    },
    // Renames files for browser caching purposes
    // {
     //             'dist/footer.html': 'dist/footer.html'
      //        }
    filerev: {
      dist: {
        src: [
          //'<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css'
          //'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          //'<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.app %>/head.html','<%= yeoman.app %>/footer.html'],
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>','<%= yeoman.dist %>/images']
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images'
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
          cwd: '<%= yeoman.dist %>',
          src: ['views/{,*/}*.html'],//'*.html', 
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    requirejs: {
            options: {
                optimize: 'uglify',
                logLevel: 0,
                inlineText: true,
                preserveLicenseComments:true,
                wrap: {
                  start: '/** <%= banner %> **/\n'
                }
            },
            dist: {
                options: {
                    mainConfigFile: 'app/scripts/app.js',
                    name: 'app',
                    out: 'dist/scripts/app.<%= grunt.template.today("yyyymmddHHMM") %>.js',
                    preserveLicenseComments:false,
                    locale:false
                }
            }
        },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.*',
            'fonts/*'
          ]
        }, {
          expand: true,
          cwd: 'bower_components/requirejs',
          src: 'require.js',
          dest: '<%= yeoman.dist %>/scripts/' 
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: 'assets/font-awesome',
          src: 'font/*',
          dest: '<%= yeoman.dist %>'
        }, {
          expand: true,
          cwd: '.',
          src: 'img/*',
          dest: '<%= yeoman.dist %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        //'imagemin',
        //'svgmin'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }
  });
  // on watch events configure jshint:all to only run on changed file 
  var fs = require('fs');
  var _path = require('path');
  var ssi = require("ssi"),
    parser = new ssi(__dirname + "/app", "", "");
  var dossi = function(filepath) {
    var html = '<!--#include virtual="/head.html" -->';
    var path,filename;
     var name = _path.basename(filepath);
          path = _path.dirname(filepath);
          filename = _path.resolve(path,'../',name);
    html += '<!--#include virtual="' + '/views/' + name + '" -->';
    html += '<!--#include virtual="/footer.html" -->'
   
    grunt.file.write(filename,parser.parse(filename, html).contents );
  }
 
  grunt.event.on('watch', function(action, filepath, target) {
    
    var path,name, html, src;
    path = _path.resolve(filepath);
//     grunt.log.writeln('+++++++++++++++++++++++');
// grunt.log.writeln(path);
          path = _path.dirname(filepath);
          
          // grunt.log.writeln(path);

          path = _path.relative( __dirname,path);

    if (target === "views") {
      if (/^app(\/|\\)views/.test(path)) {
        if (action === 'added' || action === 'changed') {
          dossi(filepath);
        } else if (action === "deleted") {
          name = _path.basename(filepath);
          path = _path.dirname(filepath);
          path = _path.resolve(path,'../',name);
         // grunt.log.writeln(path);
          if (grunt.file.isFile(path)) {
            grunt.file.delete(path);
          }
        }
      } else if (/(footer|head)\.html$/.test(filepath)) {
        src = __dirname + "/app/views";
       

        fs.readdirSync(src).forEach(function(file) {
          
          if (fs.statSync(src + '/' + file).isDirectory()) {

          } else if (/(.+)\.html$/.test(file)) {
            // 读出所有的文件
            //log('文件名:' + src + '/' + file);
           
            dossi('app/views/'+file);
          }
        });
      }

    }
    //grunt.log.writeflags(action);
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      //'wiredep',
      'concurrent:server',
      //'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    //'ngAnnotate',
    
    'copy:dist',
    //'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
    "requirejs",
    'targethtml:dist'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);

      grunt.registerMultiTask('concatmodule',function(){
        var fs     = require('fs');
        var util   = require('util');
        var path   = require('path');
        var config = grunt.config(this.name);
        var options =taskConfig= this.options();

        var log  = (function(name,msg){
            grunt.log.writeln(name + ' ' + msg);
        }).bind(this,this.name);
        
        var src, prefix, dest;
        var files = [];
        var js;
        if(options && 'src' in options && 'dest' in options){
            
        }else{
            return true;
        }
        src    = options.src;
        prefix = options.prefix;
        dest   = options.dest;

        src    = path.resolve(src);
        prefix = prefix ? (prefix.slice(-1) === '/' ? prefix : prefix + '/') : '';
        //log(src);
        
        fs.readdirSync(src).forEach(function(file) {

            if (fs.statSync(src + '/' + file).isDirectory()) {

            } else if (/(.+)\.js$/.test(file)) {
                // 读出所有的文件
                //log('文件名:' + src + '/' + file);
                files.push(file.replace(/\.js$/, ''));
            }
        });
        //log(files.join(','));
        js = options.banner ? options.banner + '\n' : '';
        js += "define([\n";
        js += "'" + prefix;
        js += files.join("',\n'" + prefix);
        js += "'],function(";
        js += files.join(",");
        js += "){\n";
        js += "var module = {};\n";
        files.forEach(function(file) {
            js += "module['" + file + "']=" + file + ";\n";
        });
        js += "module.module = function(m){return module[m];}\n";
        js += "return module;\n});";
        fs.writeFileSync(path.resolve(dest), js);
        log('task write file : ' + path.resolve(dest));
    });
};
