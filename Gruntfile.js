var testDriver = require('./test/e2e/util/test-context');

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
      selenium_install: {
        command: './bin/webdriver-manager update --standalone true --chrome false'
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
      },
      e2e: {
        options: {
          reporter: 'spec'
        },
        src: ['test/e2e/**/*.js']
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
          'bower_components/sockjs/sockjs.js',
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
      mocha_unit: {
        files: ['app.js', 'lib/**/*.js', 'test/server/**/*.js'],
        tasks: ['mochaTest:unit']
      },
      mocha_e2e: {
        files: ['app.js', 'lib/**/*.js', 'public/app/assets/**/*.js', 'test/e2e/**/*.js'],
        tasks: ['mochaTest:e2e']
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      watch_e2e: ['watch:assets', 'watch:mocha_e2e'],
      watch_all_tests: ['watch:mocha_unit', 'karma:unit_auto', 'watch:assets', 'watch:mocha_e2e']
    },

    open: {
      app: {
        path: 'http://localhost:8080'
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

  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('selenium:standalone_start', 'Start a standalone Selenium server', function() {
    var done = this.async();
    testDriver.startSelenium(done);
  });

  grunt.registerTask('selenium:standalone_stop', 'Stop standalone Selenium server', function() {
    var done = this.async();
    testDriver.stopSelenium(done);
  });

  //single run tests
  grunt.registerTask('test', ['jshint', 'test:server', 'test:client', 'test:e2e']);
  grunt.registerTask('test:client', ['karma:unit']);
  grunt.registerTask('test:e2e', ['concat', 'selenium:standalone_start', 'mochaTest:e2e', 'selenium:standalone_stop']);
  grunt.registerTask('test:server', ['mochaTest:unit']);

  //autotest and watch tests
  grunt.registerTask('autotest', ['selenium:standalone_start', 'concurrent:watch_all_tests', 'selenium:standalone_stop']);
  grunt.registerTask('autotest:client', ['karma:unit_auto']);
  grunt.registerTask('autotest:e2e', ['selenium:standalone_start', 'concurrent:watch_e2e', 'selenium:standalone_stop']);
  grunt.registerTask('autotest:server', ['watch:mocha_unit']);

  //coverage testing
  grunt.registerTask('test:coverage', ['karma:unit_coverage']);
  grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

  //installation-related
  grunt.registerTask('install', ['shell:npm_install', 'shell:selenium_install']);
  grunt.registerTask('update', ['install', 'concat']);

  //development
  grunt.registerTask('dev', ['update', 'shell:start', 'open:app', 'watch:assets']);

  //defaults
  grunt.registerTask('default', ['dev']);
};
