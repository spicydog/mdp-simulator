var app = angular.module('MDP', ['ngMaterial']);


app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
    });


app.controller('AppCtrl', function($scope) {


    $scope.modeConfig = true;

    $scope.uncertaintyAttributes = ['','U','L','R','D'];
    $scope.uncertaintyNames = ['','UP','LEFT','RIGHT','DOWN'];

    $scope.color = config.color;
    $scope.policy = [];
    $scope.box = [];
    $scope.size = {};

    $scope.mdp = null;

    $scope.stepCount = 0;
    $scope.delay = 400;

    $scope.settings = config.init;

    $scope.size.width = $scope.settings.fieldSize.w;
    $scope.size.height = $scope.settings.fieldSize.h;

    $scope.solution = '';

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };


    $scope.test = function(i, j) {
        return j;
    };

    $scope.toggleField = function(y, x) {
        if (y < $scope.size.height && x < $scope.size.width) {
            if ($scope.settings.fields[y] === undefined) {
                $scope.settings.fields[y] = [];
            }
            if ($scope.settings.fields[y][x] === undefined) {
                $scope.settings.fields[y][x] = '#';
            }

            switch ($scope.settings.fields[y][x]) {
                case 'G':
                    $scope.settings.fields[y][x] = 'T';
                    $scope.settings.utilities[y][x] = -1.0;
                    $scope.settings.rewards[y][x] = -1.0;
                    break;
                case 'T':
                    $scope.settings.fields[y][x] = '#';
                    $scope.settings.utilities[y][x] = 0.0;
                    $scope.settings.rewards[y][x] = 0.0;
                    break;
                case '#':
                    $scope.settings.fields[y][x] = '.';
                    $scope.settings.utilities[y][x] = config.default.reward;
                    $scope.settings.rewards[y][x] = config.default.utility;
                    break;
                default:
                    $scope.settings.fields[y][x] = 'G';
                    $scope.settings.utilities[y][x] = 1.0;
                    $scope.settings.rewards[y][x] = 1.0;
                    break;
            }
        }
    };

    $scope.settingBgColor = function(y, x) {


        if ($scope.settings.fields[y] === undefined) {
            $scope.settings.fields[y] = [];
            $scope.settings.rewards[y] = [];
            $scope.settings.utilities[y] = [];
        }

        if ($scope.settings.fields[y][x] === undefined) {
            $scope.settings.fields[y][x] = '.';
            $scope.settings.rewards[y][x] = config.default.reward;
            $scope.settings.utilities[y][x] = config.default.utility;
        }

        if (y <$scope.size.height && x < $scope.size.width) {
            switch ($scope.settings.fields[y][x]) {
                case 'G': return $scope.color.goal;
                case 'T': return $scope.color.sand;
                case '#': return $scope.color.wall;
                default: return $scope.color.normal;
            }
        }
        return $scope.color.wall;
    };

    $scope.bgColor = function(y, x) {
        if ($scope.mdp != null) {
            if (y < $scope.mdp.fieldSize.y && x < $scope.mdp.fieldSize.x) {

                if (y === $scope.mdp.currentCoordinate.y) {
                    if (x === $scope.mdp.currentCoordinate.x) {
                        return  $scope.color.me;
                    }
                }
                switch ($scope.mdp.fields[y][x]) {
                    case 'G': return $scope.color.goal;
                    case 'T': return $scope.color.sand;
                    case '#': return $scope.color.wall;
                    default: return $scope.color.normal;
                }
            }

        }
        return $scope.color.wall;
    };


    $scope.pointer = function(y, x) {
        if ($scope.mdp != null) {
            if (y < $scope.mdp.fieldSize.y && x < $scope.mdp.fieldSize.x) {
                if ($scope.mdp.fields[y][x] === '.') {
                   return 'pointer';
                }
            }
        }
        return 'not-allowed';
    };

    $scope.reset = function() {

        var mdp = new MDP();
        mdp.fields = JSON.parse(JSON.stringify($scope.settings.fields));
        mdp.rewards = JSON.parse(JSON.stringify($scope.settings.rewards));
        mdp.utilities = JSON.parse(JSON.stringify($scope.settings.utilities));
        mdp.movePop = JSON.parse(JSON.stringify($scope.settings.uncertainty));
        mdp.gamma = JSON.parse(JSON.stringify($scope.settings.gamma));
        mdp.setFieldSize($scope.size.width, $scope.size.height);

        mdp.setInitPosition(mdp, 0, 0);


        mdp.logSolution = function(message) {
            console.log(message);
            $scope.solution += message + "\n";
        };

        $scope.mdp = mdp;

        $scope.stepCount = mdp.stepCount;
        $scope.refresh();
    };

    $scope.step = function() {
        $scope.stepCount++;
        $scope.mdp.step();
        $scope.refresh();
    };

    $scope.autoRunning = false;
    $scope.auto = function() {
        $scope.autoRunning = !$scope.autoRunning;
        $scope.autoRun();
    };

    $scope.autoRun = function() {
        if ($scope.autoRunning === true) {
            $scope.step();
            setTimeout(function(){ $scope.autoRun(); }, 500-$scope.delay);
            $scope.$apply();
        }
    };

    $scope.refresh = function() {
        $scope.policy = $scope.mdp.policy;
    };

    $scope.utilities = function(y, x) {
        if ($scope.mdp != null) {
            if (y < $scope.mdp.fieldSize.y && x < $scope.mdp.fieldSize.x) {
                var n = $scope.mdp.utilities[y][x];
                return n.toFixed(4).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            }
        }

        return '-';
    };

    $scope.setCurrentPosition = function(y, x) {
        if ($scope.pointer(y,x) === 'pointer') {
            $scope.mdp.setCurrentCoordinate($scope.mdp, x, y);
        }
    };

});