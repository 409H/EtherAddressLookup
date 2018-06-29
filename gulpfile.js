const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', function() {
    gulp.src('css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(f => f.base))
});

gulp.task('default', ['sass'], function() {
    gulp.watch('css/*.scss', ['sass']);
})