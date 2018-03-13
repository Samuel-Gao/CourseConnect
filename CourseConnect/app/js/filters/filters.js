/*
 * Module filters
 */

var filterModule = angular.module('Filters', []); // Create or retrieve module

/*
 * Return true if the string piped in contains "pass" regardless of case.
 * Used for test result transformation.
 *
 * @return {boolean}
 */
filterModule.filter('isPassed', function () {
    return function (result) {
        return result.toLowerCase().indexOf("pass") > -1;
    };
});

/*
 * Return true if the string piped in contains "fail" regardless of case.
 * Used for test result transformation.
 *
 * @return {boolean}
 */
filterModule.filter('isFailed', function () {
    return function (result) {
        return result.toLowerCase().indexOf("fail") > -1;
    };
});

/*
 * Return true if the string piped in contains "skip" regardless of case.
 * Used for test result transformation.
 *
 * @return {boolean}
 */
filterModule.filter('isSkiped', function () {
    return function (result) {
        return result.toLowerCase().indexOf("skip") > -1;
    };
});

/*
 * Return true if the string piped in contains "null" regardless of case.
 * Used for test result transformation.
 *
 * @return {boolean}
 */
filterModule.filter('isNull', function () {
    return function (result) {
        return result.toLowerCase().indexOf("null") > -1;
    };
});

/*
 * Return true if the string piped in is empty.
 *
 * @return {boolean}
 */
filterModule.filter('isNotEmptyString', function () {
    return function (str) {
        return str.length > 0;
    };
});

/*
 * Return a copy of the original string piped in with all spaces replaced by
 * dashes.
 *
 * @return {string}
 */
filterModule.filter('replaceSpacesWithDashes', function () {
    return function (str) {
        return str;
        //return str.replace(/ /g, '-');
    };
});

/*
 * Return a copy of the original string piped in with all dashes replaced by
 * spaces.
 *
 * @return {string}
 */
filterModule.filter('replaceDashesWithSpaces', function () {
    return function (str) {
        return str;
        //return str.replace(/-/g, ' ');
    };
});

/*
 * Return a copy of the original string piped in with all spaces trimmed.
 *
 * @return {string}
 */
filterModule.filter('trimAllSpaces', function () {
    return function (str) {
        return str.replace(/ /g, '');
    };
});
