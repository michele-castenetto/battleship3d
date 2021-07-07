

var E3D = E3D || {};
(function(E3D) {


    const Tools = (function() {
        function Tools() {}
        return Tools;
    })();
    E3D.Tools = Tools;


    var Random = (function () {
        var Random = function() {  
        };
        Random._get = function (a, b) {
            return a + Math.random() * (b - a);
        };
        Random.get = function (a, b) {
            if (a === undefined) {
                a = 0;
                if (b === undefined) {
                    b = 0;
                }
            } else {
                if (b === undefined) {
                    b = a;
                    a = 0;
                } else {
                    if (b < a) {
                        return 0;
                    }
                }
            }
            return Random._get(a, b);
        };
        Random.getInt = function (a, b) {
            return Math.floor(Random.get(a, b));
        };
        return Random;
    })();
    Tools.Random = Random;


    var Timer = (function () {
        function Timer(params) {
            params = params || {};
            this.onElapsed = params.onElapsed || null;
            this.interval = params.interval || 1000;
            this._limit = params.limit || 0;
            this._running = false;
            this._time = 0;
        }

        var _run = function() {
            var _this = this;
            if (_this._limit && _this._time > _this._limit) {
                _this._running = false;
            }
            if (!_this._running) {
                return;
            }
            _this._time += _this.interval;
            _this.onElapsed();
            setTimeout(function () {
                _run.apply(_this);
            }, _this.interval);
        };

        Timer.prototype.start = function () {
            this._running = true;
            _run.apply(this);
        };

        Timer.prototype.stop = function () {
            this._running = false;
        };

        return Timer;

    })();
    Tools.Timer = Timer;
    


})(E3D);


