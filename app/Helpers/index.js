'use strict'

const crypto = use('crypto')
const Helpers = use('Helpers')


/**
 * Generate random string
 * @param {int} length - String's  length
 * @return {string}
 */


const str_random = async (length = 40) => {
    let string = ''
    let len = string.length

    if (len < length) {
        let size = length - len
        console.log(`SIZE IN STR_RANDOM: ${size}`);
        let bytes = await crypto.randomBytes(size)
        console.log(`BYTES IN STR_RANDOM: ${bytes}`);
        let buffer = Buffer.from(bytes)
        console.log(`BUFFER IN STR_RANDOM: ${buffer}`);
        string += buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, size)
    }

    return string
}

/**
 * Move a single file to a specified path, if there is no path, it will be moved
 * to 'publics/uploads'.
 *
 * @param {FileJar} file - Archieve to be moved
 * @param {pathway} path - Path which file whill be placed
 * @return { Object<FileJar> }
 *
 */

const manageSingleUploads = async (file, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')
    const randomName = await str_random(30)

    let fileName = `${new Date().getTime}-${randomName}.${file.subtype}`

    await file.move(path, { name: fileName })

    return file
}


/**
 * Move a multiples files to a specified path, if there is no path, it will be moved
 * to 'publics/uploads'.
 *
 * @param { FileJar } fileJar - Archieves to be moved
 * @param { pathway } path - Path which file whill be placed
 * @return { Object }
 *
 */

const manageMultiplesUploads = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPath('uploads')
    let successes = [], errors = [];

    await Promise.all(fileJar.files.map(async file =>{
        let randomName = str_random(30)
        let fileName = `${new Date().getTime}-${randomName}.${file.subtype}`
        await file.move(path, { name: fileName })

        if(file.moved())
            successes.push(file)
        else
            errors.push(file.error())
    }))

    return {successe, erros}
}


/**
 * token:     description:             example:
 * #YYYY#     4-digit year             1999
 * #YY#       2-digit year             99
 * #MMMM#     full month name          February
 * #MMM#      3-letter month name      Feb
 * #MM#       2-digit month number     02
 * #M#        month number             2
 * #DDDD#     full weekday name        Wednesday
 * #DDD#      3-letter weekday name    Wed
 * #DD#       2-digit day number       09
 * #D#        day number               9
 * #th#       day ordinal suffix       nd
 * #hhhh#     2-digit 24-based hour    17
 * #hhh#      military/24-based hour   17
 * #hh#       2-digit hour             05
 * #h#        hour                     5
 * #mm#       2-digit minute           07
 * #m#        minute                   7
 * #ss#       2-digit second           09
 * #s#        second                   9
 * #ampm#     "am" or "pm"             pm
 * #AMPM#     "AM" or "PM"             PM
 *
 * var now = new Date;
 * console.log( now.customFormat( "#DD#/#MM#/#YYYY# #hh#:#mm#:#ss#" ) );
 */



const customFormat = formatString => {
    var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
    YY = ((YYYY = this.getFullYear()) + "").slice(-2);
    MM = (M = this.getMonth() + 1) < 10 ? ('0' + M) : M;
    MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
    DD = (D = this.getDate()) < 10 ? ('0' + D) : D;
    DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()]).substring(0, 3);
    th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
    formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
    h = (hhh = this.getHours());
    if (h == 0) h = 24;
    // if (h>12) h-=12;
    hh = h < 10 ? ('0' + h) : h;
    hhhh = hhh < 10 ? ('0' + hhh) : hhh;
    AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
    mm = (m = this.getMinutes()) < 10 ? ('0' + m) : m;
    ss = (s = this.getSeconds()) < 10 ? ('0' + s) : s;
    return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
};

module.exports = {
    str_random,
    customFormat,
    manageSingleUploads,
    manageMultiplesUploads
}