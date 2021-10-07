var compatibileHelper = new function () {
    var ADVANCED_CUSTOMER_SEARCH = ['4.0.0.852', '4.1.0.780', '4.2.0.868'];

    this.advancedSearchCompatible = function(currentVersion) {
        var status = getCompatibleStatus(ADVANCED_CUSTOMER_SEARCH, currentVersion);
        return status;
    }

    function compareVersions(baseVersion, currentVersion) {
        var a = baseVersion.split('.')
            , b = currentVersion.split('.')
            , i = 0, len = Math.max(a.length, b.length);

        for (; i < len; i++) {
            if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
                return 1;
            } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
                return -1;
            }
        }  
        return 0;
    }

    function getCompatibleStatus(featureType, currentVersion) {
        var currentBaseVersion = currentVersion.substring(0, 4);
        var featureBase = featureType.find(function (element){
            return (element.indexOf(currentBaseVersion) != -1);
        })
        if (featureBase) {
            var status = compareVersions(featureBase, currentVersion);
            return status <= 0 ? true : false;
        } else if (compareVersions(featureType[featureType.length - 1], currentVersion) < 0) {
           return true;
       } else {
            return false;
        }
    }
}
