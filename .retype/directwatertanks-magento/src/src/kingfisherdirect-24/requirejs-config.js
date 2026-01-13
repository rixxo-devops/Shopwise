// defines a dummy-module that can be used to replace
define('dummy-module', function () {})

var config = {
    map: {
        "*": {
            "jquery/jquery-migrate": "dummy-module",
        }
    }
}
