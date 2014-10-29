/**
 * @fileOverview 围住神经猫-EASEL版本
 * @author meng<zhangmeng712@gmail.com>
 *
 */

(function (cjs) {

    var lib = {};
    var stage = null;
    var container;
    var loader;


    lib.resources = [
        {
            src: "assets/stay.png", id: "stay"
        },
        {
            src: "assets/weizhu.png", id: "weizhu"
        },
        {
            src: "assets/bg.jpg", id: "bg"
        },
        {
            src: "assets/failed.png", id: "fail"
        },
        {
            src: "assets/victory.png", id: "victory"
        },
        {
            src: "assets/replay.png", id: "replay"
        },
        {
            src: 'assets/pot1.png',
            id: 'unselcircle'
        },
        {
            src: 'assets/pot2.png',
            id: 'selcircle'
        }
    ];

    lib.Cat = {};
    lib.Circle = {};

    lib.circleArr = [[], [], [], [], [], [], [], [], []];


    var pathNumber = null;
    var gameResult = null;
    var recordArr =  [[], [], [], [], [], [], [], [], []];
    var currentCat;
    var blockTotal;

    //猫的位置偏移量让它能够在圆圈的合适位置
    var CATOFFSET = {
        x: (61-45)/2,
        y: 93-32
    };

    // 初始化游戏stage
    lib._init = function () {
        stage = new cjs.Stage('gameCanvas');
        if (!stage) {
            return;
        }
        cjs.Ticker.setFPS(30);
        cjs.Ticker.addEventListener("tick", stage);
        stage.mouseEventsEnabled = true;
        cjs.Touch.enable(stage);

        //加载图片资源
        loader = new cjs.LoadQueue(false);
        loader.addEventListener("complete", lib.handleResourcesLoaded);
        loader.loadManifest(lib.resources);

    };

    //资源加载后初始画布、背景、猫
    lib.handleResourcesLoaded = function () {
        var bg = new cjs.Bitmap(loader.getResult('bg'));
        bg.scaleX = 0.7;
        bg.scaleY = 0.7;
        lib.Bg = bg;
        container = new cjs.Container();

        var data = {
            images: ["assets/stay.png"],
            frames: {
                regX: 0,
                regY: 0,
                width: 61,
                height: 93

            },
            animations: {
                "stay1": [0,7, "stay2", 0.5],
                "stay2": [8,15, "stay1", 0.5]
            }

        };

        var data1 = {
            images: ["assets/weizhu.png"],
            frames: {
                regX: 1,
                regY: 0,
                width: 64,
                height: 92

            },
            animations: {
                stay3 : [0, 14, "stay3", 0.5]
            }
        };

        var spriteSheet = new cjs.SpriteSheet(data);
        var spriteSheet1 = new cjs.SpriteSheet(data1);
        lib.Cat.stay = new cjs.Sprite(spriteSheet, "stay1");
        lib.Cat.move = new cjs.Sprite(spriteSheet1, "stay3");

        lib.renderGameView();

    };


    //渲染主页面
    lib.renderGameView = function () {
        //绘制圆圈
        //绘制猫咪
        pathNumber = 0;
        blockTotal = 0;
        var indexY;
        for (indexY = 0; indexY < 9; indexY++)
        {
            for (var indexX = 0; indexX < 9; indexX++)
            {
                var default_circle = loader.getResult('unselcircle');
                var c = new cjs.Bitmap(default_circle);
                c.selected = false;
                lib.circleArr[indexX][indexY] = c;
                recordArr[indexX][indexY] = false;
                c.x = indexY % 2 ? indexX * 45 + 15 : indexX * 45;
                c.y = indexY * 45;
                c.indexX = indexX;
                c.indexY = indexY;

                if (indexX == 4 && indexY == 4)
                {
                    //猫猫当前的位置
                    currentCat = c;
                }
                else if (Math.random() < 0.1)
                {
                    //设置为橙色状态
                    c.image = loader.getResult('selcircle');
                    c.selected = true;
                    blockTotal ++;

                }
                container.addChild(c);
                c.addEventListener("click", lib.circleClicked);
            }
        }

        //修正猫的位置
        lib.Cat.stay.x = currentCat.x - CATOFFSET.x;
        lib.Cat.stay.y = currentCat.y - CATOFFSET.y;
        container.addChild(lib.Cat.stay);
        container.y = 280;
        container.x = 8;
        stage.addChild(lib.Bg, container);
        stage.update();
    };

    // 点击圆球
    lib.circleClicked = function (e) {

        //点击红球不反应
        var target = e.target;
        if (target.selected) {
            return;
        }
        //选中是灰色的--设置成对应的红色
        //处理猫猫的动作
        target.image = loader.getResult('selcircle');
        target.selected = true;
        blockTotal++;
        pathNumber ++;
        lib.moveCat();

    };

    //猫移动算法 AI 输入：x, y  输出 0 -1 left/right/leftup/leftdown/rightup/rightdown

    lib.moveCat = function() {

        var x = currentCat.indexX;
        var y = currentCat.indexY;
        if (x == 0 || x == 8 || y == 0 || y == 8) {
            lib.renderLose();
            return;
        }
        var result;
        var temp = null;
        if (AI && AI.getDistance) {
            result = AI.getDistance(x, y, lib.circleArr, blockTotal);
            //result pos result
            if (result == -1) {


                lib.Cat.move.x = currentCat.x - CATOFFSET.x;
                lib.Cat.move.y = currentCat.y - CATOFFSET.y;
                container.removeChild(lib.Cat.stay);
                container.addChild(lib.Cat.move);
                //判断是不是没有步骤可以走了--临界点都是selected
                if (lib.getAdjacent(x,y)['left'].selected && lib.getAdjacent(x,y)['right'].selected
                    && lib.getAdjacent(x,y)['leftup'].selected&&lib.getAdjacent(x,y)['rightup'].selected
                    && lib.getAdjacent(x,y)['rightdown'].selected && lib.getAdjacent(x,y)['rightup'].selected) {
                    lib.renderWin();
                    return;
                } else {
                    //被圈住了 但是没有赢 找没有的地方跳
                    var allAdjacentPoints = lib.getAdjacent(currentCat.indexX, currentCat.indexY);
                    var directionArr = [];
                    for (var item in allAdjacentPoints) {
                        var curCircle = allAdjacentPoints[item];
                        if (!curCircle.selected) {
                            //去掉点击的方向
                            directionArr.push(allAdjacentPoints[item]);

                        }
                    }
                    currentCat = directionArr[0];
                    lib.Cat.move.x = currentCat.x - CATOFFSET.x;
                    lib.Cat.move.y = currentCat.y - CATOFFSET.y;

                }

            } else if (result == 0) {
                //输了
                lib.renderLose();
                return;
            } else {
                // go on
                var newCatPos = lib.getAdjacent(currentCat.indexX, currentCat.indexY);
                currentCat = newCatPos[result];
                lib.Cat.stay.x = currentCat.x - CATOFFSET.x;
                lib.Cat.stay.y = currentCat.y - CATOFFSET.y;

            }

        }


    };

    //渲染输了的页面
    lib.renderLose = function() {
        var fail = new cjs.Bitmap(loader.getResult('fail'));
        var replay = new cjs.Bitmap(loader.getResult('replay'));
        var fail_txt_1 = new cjs.Text('0', 'bold 20px Arial', '#FF0000');
        var fail_txt_2 = new cjs.Text('0', 'bold 20px Arial', '#FFffff');
        fail.x = -10;
        fail.y = -200;
        replay.x = 110;
        replay.y = 160;
        fail_txt_1.text = '你没有抓住神！经！猫！';
        fail_txt_1.x = 100;

        fail_txt_2.text = '神经病院长又发神经病了！';
        fail_txt_2.shadow = new createjs.Shadow("#000000", 0, 0, 10);
        fail_txt_2.y = 40;
        fail_txt_2.x = 90;

        container.addChild(fail,replay, fail_txt_1, fail_txt_2);

        replay.addEventListener("click",function () {
            container.removeAllChildren();
            lib.renderGameView();
        });

    };

    //渲染赢页面
    lib.renderWin = function () {
        var victory = new cjs.Bitmap(loader.getResult('victory'));
        var replay = new cjs.Bitmap(loader.getResult('replay'));
        var victory_txt_1 = new cjs.Text('0', 'bold 20px Arial', '#FF0000');
        victory.x = -10;
        victory.y = -200;
        replay.x = 110;
        replay.y = 160;
        victory_txt_1.text = '您用了' + pathNumber + '抓住了神经猫！';
        victory_txt_1.x = 100;

        container.addChild(victory,replay, victory_txt_1);

        replay.addEventListener("click",function () {
            container.removeAllChildren();
            lib.renderGameView();
        });
    };

    //计算猫周围点的坐标
    lib.getAdjacent = function (x, y) {
        var adj = {
            'left':  lib.circleArr[x - 1][y],
            'right': lib.circleArr[x + 1][y],
            'leftup': y % 2 ? lib.circleArr[x][y-1] : lib.circleArr[x-1][y-1],
            'leftdown':  y % 2 ? lib.circleArr[x][y+1] : lib.circleArr[x-1][y+1],
            'rightup': y % 2 ? lib.circleArr[x+1][y-1] : lib.circleArr[x][y-1],
            'rightdown': y % 2 ? lib.circleArr[x+1][y+1] : lib.circleArr[x][y+1]
        };
        return adj;
    };

    lib._init();


}(createjs));


