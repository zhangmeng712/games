$(document).ready(function () {

    var stage;
    var canvas = $('#J_pingpang_canv').length && $('#J_pingpang_canv')[0];
    var container;
    var IMG_FILE_TYPE = PreloadJS.IMAGE;
    var movieClip;
    var tkr = new Object();


    //游戏中的变量
    var player;
    var cpu;
    var ball;
    var playerScore;
    var cpuScore;
    var bg;

    //装载图片的bitmap列表
    var BitMaps = {};

    //球类
    var Ball = {
        HEIGHT: 22,
        WIDTH: 22,
        MAX_VELOCITY: 19,
        MIN_ANGLE: Math.PI/5,
        ROTATIONAL_BOOST:  Math.PI * 0.15,
        HALF_PADDLE_HEIGHT: 66/2,
        INIT_SPEED: 5

    };

    //右侧电脑
    var Cpu = {
        WIDTH: 13,
        HEIGHT: 66
    };

    //左侧player
    var Player = {
        WIDTH: 13,
        HEIGHT: 66
    };

    // 游戏常量
    var Pong = {
        GAME_WIDTH: 480,
        GAME_HEIGHT: 320,
        PLAYER_PADDLE_EASE: 0.3,
        CPU_PADDLE_MIN_EASE: 0.005,
        CPU_PADDLE_MAX_EASE: 0.13,
        GAME_LIMIT: 10
    };

    var fn = {
        value_easeExponential: function(prop, init, maxDelta) {
            return maxDelta * Math.pow(2, 10 * (prop - 1)) + init;
        }
    };


    //所有资源列表
    var Manifest = [
        {
            src: "bg.png",
            id: "bg"
        },
        {
            src: "main.png",
            id: "main"
        },
        {
            src: "startB.png",
            id: "startB"
        },
        {
            src: "creditsB.png",
            id: "creditsB"
        },
        {
            src: "credits.png",
            id: "credits"
        },
        {
            src: "paddle.png",
            id: "cpu"
        },
        {
            src: "paddle.png",
            id: "player"
        },
        {
            src: "ball.png",
            id: "ball"
        },
        {
            src: "win.png",
            id: "win"
        },
        {
            src: "lose.png",
            id: "lose"
        }
    ];

    // text列表


    var initResources = function () {
        var preloader = new PreloadJS();

        //显示进度条
        var showProgress = function () {

        };
        //每个文件加载完成后
        var eachFileOnload = function (event) {
            var type = event.type;
            if (event.type == IMG_FILE_TYPE) {
                var img = new Image();
                img.src = event.src;
                BitMaps[event.id] = new Bitmap(img);
            }

        };

        //完成所有的资源加载后显示的内容
        var handleResourcesComplete = function () {
            var mc = new movieClip();
            stage.addChild(mc);
            mc.play();

        };
        preloader.onProgress = showProgress;
        preloader.onFileLoad = eachFileOnload;
        preloader.onComplete = handleResourcesComplete;
        preloader.loadManifest(Manifest);

    };


    //渲染开始
    var initMovieClip = function () {
        var p = new MovieClip();
        movieClip = function (mode, startPosition, loop) {
            if (loop == null) {
                loop = false;
            }
            this.initialize(mode, startPosition, loop, {
            });

            var txtCol = "#00FF00"; //the text color
            var txtFont = "26px 'fixedsys_excelsior_3', 'Lucida Console', Monaco, monospace";

            var txt_start = new Text("", txtFont, txtCol);
            txt_start.x = 30;
            txt_start.y = 90;
            stage.addChild(txt_start);
            txt_start.shadow = new Shadow("#00FF00", 3, 0, 10);

            var txt_title = new Text("Dear Jiang...", txtFont, txtCol);
            txt_title.x = 30;
            txt_title.y = 90;
            stage.addChild(txt_title);

            var writeInt;
            var writeText = function (myText, myTextField) {
                var i = 0;

                function write() {
                    if (i <= myText.length) {
                        myTextField.text = myText.substr(0, i) + "_";
                        //randTypeSnd();
                        i = i + 1;
                    } else {
                        myTextField.text = myText.substr(0, i);
                        clearInterval(writeInt);
                    }
                }

                clearInterval(writeInt);
                writeInt = setInterval(write, 40);
            };

            this.frame_1 = function () {
            };
            this.frame_2 = function () {
                writeText("Welcome to Pong", txt_title);
            };
            this.frame_3 = function () {
                writeText("Let's have fun....", txt_title);
            };
            this.frame_4 = function () {
                mountBeginView();
            }

            this.timeline.addTween(Tween.get(this).call(this.frame_1).wait(20).call(this.frame_2).wait(40).call(this.frame_3).wait(50).call(this.frame_4).wait(60))
            //this.timeline.addTween(Tween.get(this).call(this.frame_4))
        };
        movieClip.prototype = p;
    };


    var initPosition = function () {
        //初始化球速度
        ball.x = 240 - 15;
        ball.y = 160 - 15;
        player.y = 160 - 37.5;
        cpu.y = 160 - 37.5;
        Ball.passedEdge = false;
        var goingRight = Math.random() > 0.5;
        Ball.direction =  goingRight ? (Math.PI * 0.125) + (Math.random() * Math.PI * 0.25) : (Math.PI * 1.125) + (Math.random() * Math.PI * 0.25);
        Ball.velocity = Ball.INIT_SPEED;
        Ball.xVel = Math.sin(Ball.direction) * Ball.velocity;
        Ball.yVel = -1 * (Math.cos(Ball.direction) * Ball.velocity);


    };

    var startGame = function () {

        bg.onPress = null;
        //使得图形随着鼠标移动而运动
        stage.onMouseMove = function (e) {
            player.y = e.stageY - 5;
        };

        initPosition();
        //新的api 会用 Ticker.addEventListener('tick', function () {});
        // 第二个参数决定是否会暂停
        Ticker.addListener(tkr, false);
        tkr.tick = update1;
    };

    var reset = function () {
        initPosition();
        stage.onMouseMove = null;
        Ticker.removeListener(tkr);
        bg.onPress = startGame;
    };
    //随着tick刷新,运动的帧
//    var update = function (e1, e2) {
//
//        ball.x = ball.x + ballXSpeed;
//        ball.y = ball.y + ballYSpeed;
//
//        //cpu自动运动 去掉阴影 球 28 横条 64
//        // 以球为轴心， 当 横条在轴心上方的时候 需要加速 当横条在轴心的下方的时候减速
//
//
//        if ((cpu.y + 32) < (ball.y - 14)) {
//            cpu.y = cpu.y + cpuSpeed;
//        }
//        else if ((cpu.y + 32) > (ball.y + 14)) {
//            cpu.y = cpu.y - cpuSpeed;
//        }
//
//
//
//        //球反弹
//        if ((ball.y) < 0 || (ball.y + (30)) > 320) {
//            ballYSpeed = -ballYSpeed;
//        }
//
//        //球出界
//        if ((ball.x) < 0) {
//            ballXSpeed = -ballXSpeed;
//            cpuScore.text = parseInt(cpuScore.text + 1);
//            reset();
//        }
//
//        if ((ball.x + (30)) > 480) {
//            ballXSpeed = -ballXSpeed;
//            playerScore.text = parseInt(playerScore.text + 1);
//            reset();
//        }
//
//        // 球撞击
//
//        if (ball.x + 30 > cpu.x && ball.x + 30 < cpu.x + 22 && ball.y >= cpu.y && ball.y < cpu.y + 75) {
//            ballXSpeed *= -1;
//            // SoundJS.play('hit');
//        }
//        if (ball.x <= player.x + 22 && ball.x > player.x && ball.y >= player.y && ball.y < player.y + 75) {
//            ballXSpeed *= -1;
//            //SoundJS.play('hit');
//        }
//        //player控制 下方不要出界
////        if (player.y > (320 + 80)) {
////            player.y = 320 -60
////        }
//
//    };


   var alert = function (e) {
       Ticker.removeListener(tkr);
       stage.onMouseMove = null;
       bg.onPress = null
       var win = BitMaps.win;
       var lose = BitMaps.lose;
       if(e == 'win')
       {
           win.x = 140;
           win.y = -90;

           stage.addChild(win);
           Tween.get(win).to({y: 115}, 300);
           win.onPress = function () {
               console.log('winwin');
               mountBeginView();
           }
       }
       else
       {
           lose.x = 140;
           lose.y = -90;
           stage.addChild(lose);
           Tween.get(lose).to({y: 115}, 300);
           lose.onPress = function () {
               console.log('loselose');
               mountBeginView();
           }
       }
   };

    //测试新的tick算法
    var update1 = function () {

        ball.x += Ball.xVel;
        ball.y += Ball.yVel;

        //Move CPU paddle//
        var rightDist = (Ball.xVel < 0) ? 0.3 * (Pong.GAME_WIDTH - ball.x) : Pong.GAME_WIDTH + ball.x;
        var cpuEase = fn.value_easeExponential(rightDist/(Pong.GAME_WIDTH*2), Pong.CPU_PADDLE_MIN_EASE, (Pong.CPU_PADDLE_MAX_EASE - Pong.CPU_PADDLE_MIN_EASE));
        cpu.y = cpu.y + ((ball.y - cpu.y) * cpuEase);

        //player 不许下去太多
        if (player.y > (320 + 71)) {
            player.y = (320 + 5)
        }


        //球撞上下墙的处理
        var ball_wall_bounce  = function() {
            if (Ball.wallBouncedLastStep) {
                Ball.wallBouncedLastStep = false;
                return;
            }
            Ball.direction = (Ball.direction * -1) + Math.PI;
            Ball.xVel = Math.sin(Ball.direction) * Ball.velocity;
            Ball.yVel = -1 * (Math.cos(Ball.direction) * Ball.velocity);
            Ball.wallBouncedLastStep = true;
        };

        if (ball.y < 5) {
            ball_wall_bounce();
        } else if ((ball.y + Ball.HEIGHT) > Pong.GAME_HEIGHT) {
            ball_wall_bounce();
        } else {
            Ball.wallBouncedLastStep = false;
        }


        //球碰到弹出---速度和弹性成正比
        var ball_paddle_bounce = function(paddleY, side) {
            if (Ball.velocity < Ball.MAX_VELOCITY) Ball.velocity ++;

            Ball.direction += (2 * ((Math.PI * 0.5) - Ball.direction)) + Math.PI;

            var boost = Ball.ROTATIONAL_BOOST * ((paddleY - ball.y) / Ball.HALF_PADDLE_HEIGHT);
            Ball.direction += side == "right" ? boost : (-1 * boost);

            Ball.direction %= Math.PI * 2;

            if (side == "left") {
                if ( (Ball.direction < Ball.MIN_ANGLE) || (Ball.direction > (Math.PI * 1.5)) ) Ball.direction = Ball.MIN_ANGLE;
                else if (Ball.direction > (Math.PI - Ball.MIN_ANGLE)) Ball.direction = Math.PI - Ball.MIN_ANGLE;
            } else {
                if ( (Ball.direction < (Math.PI + Ball.MIN_ANGLE)) && (Ball.direction > (Math.PI * 0.5)) ) Ball.direction = Math.PI + Ball.MIN_ANGLE;
                else if (Ball.direction > ((Math.PI * 2) - Ball.MIN_ANGLE) || (Ball.direction < (Math.PI * 0.5))) Ball.direction = (Math.PI * 2) - Ball.MIN_ANGLE;
            }

            Ball.xVel = Math.sin(Ball.direction) * Ball.velocity;
            Ball.yVel = -1 * (Math.cos(Ball.direction) * Ball.velocity);
        };



        var intersectingPaddle = false;
        var setPassedEdge = false;

        //右侧碰撞
        if ((ball.x + Ball.WIDTH) >= cpu.x && (ball.x + Ball.WIDTH) < (cpu.x + Cpu.WIDTH)) {		//Past left edge of right paddle
            if (ball.y >= cpu.y && ball.y < (cpu.y + Cpu.HEIGHT) ) {
                intersectingPaddle = true;
            } else {
                setPassedEdge = true;
            }

            if (intersectingPaddle) {
                if (Ball.passedEdge) {
                    if ((ball.y < cpu.y) && (Ball.yVel > 0)) ball_wall_bounce();//this.paddleEdge_bounce("right");
                    else if ((ball.y > cpu.y) && (Ball.yVel < 0)) ball_wall_bounce();//this.paddleEdge_bounce("right");
                } else {
                    //碰撞
                    ball_paddle_bounce(cpu.y, "right");
                    setPassedEdge = false;
                }
            }

            if (setPassedEdge) Ball.passedEdge = true;
        }


        //左侧碰撞

        if (ball.x <= (player.x + Player.WIDTH) && (ball.x > player.x)) {		//Past right edge of left paddle

            if (ball.y >= player.y && ball.y < ( player.y + Player.HEIGHT) ) {
                intersectingPaddle = true;
            } else {
                setPassedEdge = true;
            }

            if (intersectingPaddle) {
                if (Ball.passedEdge) {
                    if ((ball.y < player.y) && (Ball.yVel > 0)) ball_wall_bounce();//this.paddleEdge_bounce("left");
                    else if ((ball.y > player.y) && (Ball.yVel < 0)) ball_wall_bounce();//this.paddleEdge_bounce("left");
                } else {
                    ball_paddle_bounce(player.y, "left");
                    setPassedEdge = false;
                }
            }

            if (setPassedEdge) Ball.passedEdge = true;
        }

        //得分
        if ((ball.x + (Ball.WIDTH * 0.5)) < 0) {
            cpuScore.text = parseInt(cpuScore.text + 1);
            reset();
        } else if ((ball.x - (Ball.WIDTH * 0.5)) > Pong.GAME_WIDTH) {
            playerScore.text = parseInt(playerScore.text + 1);
            reset();
        }

        if(playerScore.text == Pong.GAME_LIMIT)
        {
            alert('win');
        }

        /* Check for Game Over */

        if(cpuScore.text == Pong.GAME_LIMIT)
        {
            alert('lose');
        }


    };

    //游戏画布渲染
    var addGameView = function () {
        stage.removeChild(container);
        container = null;
        // Add Game View
        player = BitMaps.player;
        cpu = BitMaps.cpu;
        ball = BitMaps.ball;
        bg = BitMaps.bg;

        player.x = 2;
        player.y = 160 - 37.5;
        cpu.x = 480 - 25;
        cpu.y = 160 - 37.5;
        ball.x = 240 - 15;
        ball.y = 160 - 15;

        // Score
        playerScore = new Text('0', 'bold 20px Arial', '#A3FF24');
        playerScore.x = 211;
        playerScore.y = 20;

        cpuScore = new Text('0', 'bold 20px Arial', '#A3FF24');
        cpuScore.x = 262;
        cpuScore.y = 20;
        stage.addChild(playerScore, cpuScore, player, cpu, ball);
        stage.update();

        // Start Game
        bg.onPress = startGame;
    };


    var mountBeginView = function () {
        var startB = BitMaps.startB;
        var creditsB = BitMaps.creditsB;
        var bg = BitMaps.bg;
        var main = BitMaps.main;
        container = new Container();
        if (startB) {
            startB.x = 240 - 31.5;
            startB.y = 160;
            startB.name = 'startB';
        }

        if (creditsB) {
            creditsB.x = 241 - 42;
            creditsB.y = 200;
        }

        if (main && bg && creditsB && startB) {

            //将初始按钮当做一个组放入 游戏开始时一起向上翻开
            container.addChild(main, startB);
            stage.addChild(bg, container);
            // 开始渲染首屏
            stage.update();
            //点击开始游戏
            startB.onPress = function () {
                Tween.get(container).to({y: -320}, 300).call(addGameView);
            };
            //creditsB.onPress = showCredits;

        }


    };

    stage = new Stage(canvas);
    if (stage) {

        stage.mouseEventsEnabled = true;
        Touch.enable(stage);
        initMovieClip();
        initResources();

        //设置帧刷新
        Ticker.setFPS(30);
        Ticker.addListener(stage);
    }


});