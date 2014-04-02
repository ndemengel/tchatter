process.on('SIGINT', function() {
  try {
    console.log('Shutting down server...');
    var exec = require('child_process').exec;
    exec('grunt shell:stop', function() {
      process.exit();
    });
  }
  catch (e) {
    console.log(e);
    process.exit();
  }
});

module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    shell: {
      options: {
        stdout: true
      },
      selenium: {
        command: './selenium/start',
        options: {
          stdout: false,
          async: true
        }
      },
      protractor_install: {
        command: 'node ./node_modules/protractor/bin/webdriver-manager update'
      },
      npm_install: {
        command: 'npm install'
      },
      start: {
        command: 'npm start'
      },
      stop: {
        command: 'npm stop'
      }
    },

    connect: {
      options: {
        base: 'public/app/'
      },
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      },
      testserver: {
        options: {
          port: 9999
        }
      },
      coverage: {
        options: {
          base: 'coverage/',
          port: 5555,
          keepalive: true
        }
      }
    },

    protractor: {
      options: {
        keepAlive: true,
        configFile: "./test/protractor.conf.js"
      },
      singlerun: {},
      auto: {
        keepAlive: true
        //        options: {
        //          args: {
        //            seleniumPort: 4444
        //          }
        //        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'public/app/scripts/{,*/}*.js'
      ]
    },

    concat: {
      styles: {
        dest: './public/app/assets/app.css',
        src: [
          'public/app/styles/app.css'
          //place your Stylesheet files here
        ]
      },
      scripts: {
        options: {
          separator: ';'
        },
        dest: './public/app/assets/app.js',
        src: [
          'bower_components/angular/angular.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angular-animate/angular-animate.js',
          'public/app/scripts/homePages.js',
          'public/app/scripts/app.js'
          //place your JavaScript files here
        ]
      }
    },

    watch: {
      options: {
        livereload: 7777
      },
      assets: {
        files: ['public/app/styles/**/*.css', 'public/app/scripts/**/*.js'],
        tasks: ['concat']
      },
      protractor: {
        files: ['lib/**/*.js', 'public/app/scripts/**/*.js', 'test/e2e/**/*.js'],
        tasks: ['protractor:auto']
      }
    },

    open: {
      devserver: {
        path: 'http://localhost:8888'
      },
      coverage: {
        path: 'http://localhost:5555'
      }
    },

    karma: {
      unit: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: true,
        singleRun: false
      },
      unit_coverage: {
        configFile: './test/karma-unit.conf.js',
        autoWatch: false,
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {
          'public/app/scripts/*.js': ['coverage']
        },
        coverageReporter: {
          type: 'html',
          dir: 'coverage/'
        }
      }
    }
  });

  //single run tests
  grunt.registerTask('test', ['jshint', 'test:unit', 'test:e2e']);
  grunt.registerTask('test:unit', ['karma:unit']);
  grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);

  //autotest and watch tests
  grunt.registerTask('autotest', ['karma:unit_auto']);
  grunt.registerTask('autotest:unit', ['karma:unit_auto']);
  grunt.registerTask('autotest:e2e', ['shell:start', 'watch:protractor', 'shell:stop']);

  //coverage testing
  grunt.registerTask('test:coverage', ['karma:unit_coverage']);
  grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

  //installation-related
  grunt.registerTask('install', ['update', 'shell:protractor_install']);
  grunt.registerTask('update', ['shell:npm_install', 'concat']);

  //defaults
  grunt.registerTask('default', ['dev']);

  //development
  grunt.registerTask('dev', ['update', 'connect:devserver', 'open:devserver', 'watch:assets']);

  //server daemon
  grunt.registerTask('serve', ['connect:webserver']);

};
