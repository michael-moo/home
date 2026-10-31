
// 包装函数
module.exports = function(grunt){
    // 任务配置，所有插件的配置信息
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
                stripBanner: true,
                banner: '/*! <%=pkg.name%>-<%=pkg.version%>.js <%=grunt.template.today("yyyy-mm-dd")%>*/\n'
            },
            build: {
                src: 'src/add.js',
                dest: 'build/<%=pkg.name%>-<%=pkg.version%>.min.js'
            }            
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 注册任务
    grunt.registerTask('default', ['uglify']);
}