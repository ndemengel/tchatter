process.on('SIGINT', function() {
  try {
    console.log('Shutting down server...');
    var exec = require('child_process').exec;
    exec('npm stop', function() {
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

    mochaTest: {
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['test/server/**/*.js']
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
          'public/app/scripts/**/*.js'
          //place your JavaScript files here
        ]
      }
    },

    watch: {
      assets: {
        options: {
          livereload: 7777
        },
        files: ['public/app/styles/**/*.css', 'public/app/scripts/**/*.js'],
        tasks: ['concat']
      },
      protractor: {
        files: ['app.js', 'lib/**/*.js', 'public/app/**/*', 'test/e2e/**/*.js'],
        tasks: ['protractor:auto']
      },
      mocha: {
        files: ['app.js', 'lib/**/*.js', 'test/server/**/*.js'],
        tasks: ['mochaTest:unit']
      }
    },

    open: {
      app: {
        path: 'http://localhost:9999'
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
  grunt.registerTask('test', ['jshint', 'test:server', 'test:client', 'test:e2e']);
  grunt.registerTask('test:client', ['karma:unit']);
  grunt.registerTask('test:server', ['mochaTest:unit']);
  grunt.registerTask('test:e2e', ['shell:start', 'protractor:singlerun', 'shell:stop']);

  //autotest and watch tests
  // TODO install grunt-concurrent to defint autotest
  grunt.registerTask('autotest', ['autotest:server', 'autotest:client', 'autotest:e2e']);
  grunt.registerTask('autotest:client', ['karma:unit_auto']);
  grunt.registerTask('autotest:server', ['watch:mocha']);
  // TODO install grunt-concurrent to only run some targets of "watch" concurrently
  grunt.registerTask('autotest:e2e', ['shell:start', 'watch']);

  //coverage testing
  grunt.registerTask('test:coverage', ['karma:unit_coverage']);
  grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

  //installation-related
  grunt.registerTask('install', ['update', 'shell:protractor_install']);
  grunt.registerTask('update', ['shell:npm_install', 'concat']);

  //defaults
  grunt.registerTask('default', ['dev']);

  //development
  grunt.registerTask('dev', ['update', 'shell:start', 'watch:assets', 'open:app']);
};
