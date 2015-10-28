module.exports = function(grunt){

    grunt.initConfig({
        transport :  {
            dest : {
                options : {
                    paths : ["script"]
                },
                files: [{
                    cwd: 'script',
                    src: '**/*.js',
                    expand : true,
                    dest: 'tmp'
                }]
            } 
        },
        concat : {
            dest : {
                options : {
                    paths : ["tmp"],
                    include : "all"
                },
                files : [{
                    cwd : 'tmp',
                    src : "*.js",
                    expand : true,
                    dest : "dist"
                }]
            }
        },
        clean : {
            dest : ["tmp"]
        },
        uglify : {
            options: {
              mangle: {
                except: ['require', 'exports',"module"]
              }
            },
            dest: {
              files: [{
                expand: true,
                cwd: "dist",
                src: ["**/*.js","!incs/*.js","!**/*-debug.js"],
                dest: "dist"
              }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('build', ['transport' 
        , 'concat'
        , 'uglify'
        , 'clean'
    ]);
    
}