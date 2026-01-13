'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')(require('node-sass'))
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')
const fs = require('fs')
const sassPackageImporter = require('node-sass-package-importer')
const sassRegexReplace = require('node-sass-importer-regex-replace')
const sassLocalOverride = require('node-sass-importer-local-override')

const projectFolder = path.resolve('.')
const emailInlineStyles = "./styles/email-inline.scss"
const styleFiles = ['./styles/*.scss', `!${emailInlineStyles}`]
const styleDest = './web/css'

function findVendorFolder () {
    var composerVendorFolder = './vendor'

    for (var i = 0; i < 5; i++) {
        composerVendorFolder = path.join('..', composerVendorFolder)

        if (fs.existsSync(composerVendorFolder)) {
            composerVendorFolder = path.resolve(composerVendorFolder)
            break
        }
    }

    if (!fs.existsSync(composerVendorFolder)) {
        throw new Error("Couldn't find composer vendor folder")
    }

    return composerVendorFolder
}

const parentThemeFolder = path.resolve(findVendorFolder(), 'kingfisherdirect/theme-blank-sass')

const sassOptions = {
    outputStyle: 'compressed',
    importer: [
        sassPackageImporter(),
        sassRegexReplace([
            { pattern: /^@snowdog\//, replacement: parentThemeFolder + path.sep },
            { pattern: /^@parent\//, replacement: parentThemeFolder + path.sep }
        ]),
        sassLocalOverride(parentThemeFolder, path.resolve(projectFolder))
    ],
    includePaths: [`${parentThemeFolder}/styles`]
}

const emailInlineSassOptions = Object.assign({}, sassOptions, {
    // this is important as compiling styles with compressed output adds an extra
    // bom character, that's incompatible with Emogrifier
    outputStyle: 'expanded'
})

const exit = process.exit.bind(null, 1)

function stylesEmailInline (onError) {
    onError = onError || exit

    return gulp.src([emailInlineStyles])
        .pipe(sass(emailInlineSassOptions)
            .on('error', sass.logError)
            .on('error', onError)
        )
        .pipe(gulp.dest(styleDest))
}

function stylesDefault (onError, withSourcemaps = false) {
    onError = onError || exit

    var stream = gulp.src(styleFiles)

    if (withSourcemaps) {
        stream = stream.pipe(sourcemaps.init())
    }

    stream = stream.pipe(
        sass(sassOptions)
            .on('error', sass.logError)
            .on('error', onError)
        )

    if (withSourcemaps) {
        stream = stream.pipe(sourcemaps.write())
    }

    return stream
        .pipe(gulp.dest(styleDest))
}

/**
 * Default styles compilation with source maps
 */
exports.styles = gulp.series(
    // with source maps
    stylesDefault.bind(null, null, true),
    stylesEmailInline
)

/**
 * Watches for changes in .scss files in project and runs compilation
 */
exports.stylesWatch = function () {
    const notifier = require('node-notifier')

    // compile default ones
    exports.styles()

    const onError = err => {
        notifier.notify({
            title: err.name + ': ' + err.relativePath,
            message: err.messageOriginal,
            id: 'sass-compile',
            remove: 'sass-compile',
        })
    }

    gulp.watch('./**/*.scss', gulp.series(
        stylesDefault.bind(null, onError, true),
        stylesEmailInline.bind(null, onError)
    ))
}

exports.stylesProduction = gulp.series(
    stylesDefault,
    stylesEmailInline
)

function copyFontAwesome () {
    var fontAwesomePath = path.dirname(require.resolve('@fortawesome/fontawesome-free/webfonts/fa-solid-900.eot'))
    console.log(fontAwesomePath)
    return gulp.src(fontAwesomePath + '/fa-*')
        .pipe(gulp.dest('./web/fonts/fontawesome'))
}

exports.default = gulp.series(
    exports.stylesProduction,
    copyFontAwesome
)
