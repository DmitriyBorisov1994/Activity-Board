// Определяем переменную "preprocessor"
let preprocessor = 'sass'; // Выбор препроцессора в проекте - sass или less

let preprosExt;
if (preprocessor == 'sass') {
   preprosExt = 'scss';
} else {
   preprosExt = 'less';
}

// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модуль gulp-sass
const sass = require('gulp-sass')(require('sass'));

// gulp-less
const less = require('gulp-less');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем модуль del
const del = require('del');


function browsersync() {
   browserSync.init({ // Инициализация Browsersync
      server: { baseDir: 'app/' }, // Указываем папку сервера
      notify: false, // Отключаем уведомления
      online: true // Режим работы: true или false
   })
}

function scripts() {
   return src([
      'node_modules/jquery/dist/jquery.min.js',
      'app/js/app.js',
   ])
      .pipe(concat('app.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function styles() {
   return src('app/' + preprocessor + '/main.' + preprosExt + '') // Выбираем источник: "app/sass/main.sass(scss)" или "app/less/main.less"
      .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
      .pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
      .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
      .pipe(cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ })) // Минифицируем стили
      .pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
      .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function buildcopy() {
   return src([ // Выбираем нужные файлы
      'app/css/**/*.min.css',
      'app/js/**/*.min.js',
      'app/images/**/*',
      'app/data/**/*',
      'app/**/*.html',
   ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
      .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
   return del('dist/**/*', { force: true }) // Удаляем все содержимое папки "dist/"
}

function startwatch() {
   // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
   watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
   // Мониторим файлы препроцессора на изменения
   watch('app/**/' + preprocessor + '/**/*', styles);
   // Мониторим файлы HTML на изменения
   watch('app/**/*.html').on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
// Создаем новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, styles, scripts, buildcopy);
// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, browsersync, startwatch);