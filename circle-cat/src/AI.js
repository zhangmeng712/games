/**
 * Created by zhangmeng on 14/10/29.
 */
AI = {

};


AI.getDistance = function (x, y, circleArr, blockTotal) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            //console.log('11111:', circleArr[i][j], i, j, circleArr[i][j].indexX, circleArr[i][j].indexY, circleArr[i][j].selected);
        }
    }

    var nextX = -1;
    var nextY = -1;
    var MAX_DISTANCE = 1000;
    var minDistance = MAX_DISTANCE;
    //求最小值
    var flag = '';
    var dis = minDistance;
    var distances = {};


    var getAdjacent = function (x, y, circleArr) {
        var adj = {
            'left': circleArr[x - 1][y],
            'right': circleArr[x + 1][y],
            'leftup': y % 2 ? circleArr[x][y - 1] : circleArr[x - 1][y - 1],
            'leftdown': y % 2 ? circleArr[x][y + 1] : circleArr[x - 1][y + 1],
            'rightup': y % 2 ? circleArr[x + 1][y - 1] : circleArr[x][y - 1],
            'rightdown': y % 2 ? circleArr[x + 1][y + 1] : circleArr[x][y + 1]
        };
        return adj;
    };
    var adj = getAdjacent(x, y, circleArr);

    var smallDistance = function (x, y) {

        var flags = [
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        if (x == 0 || y == 0 || x == 8 || y == 8) {
            flag = 0;
        }
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var circle = circleArr[i][j];
                distances[i + 'x' + j] = {};
                // distances[i + 'x' +  j].circle = circle;
                if (circle.selected) {
                    flags[i][j] = true;
                }
                distances[i + 'x' + j].dis = MAX_DISTANCE;
            }
        }

        flags[x][y] = true;

        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                console.log('9999:',i, j,  flags[i][j], circleArr[i][j].selected);
            }
        }

        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {

                if (flags[i][j]) {
                    continue;
                }
                if (j % 2 == 1) {
                    //奇数行

                    if (j - 1 >= 0 && flags[i][j - 1] && !circleArr[i][j - 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i - 1 >= 0 && flags[i - 1][j] && !circleArr[i - 1][j].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (j + 1 <= 8 && flags[i][j + 1] && !circleArr[i][j + 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i + 1 <= 8 && j - 1 >= 0 && flags[i + 1][j - 1] && !circleArr[i + 1][j - 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i + 1 <= 8 && flags[i + 1][j] && !circleArr[i + 1][j].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i + 1 <= 8 && j + 1 <= 8 && flags[i + 1][j + 1] && !circleArr[i + 1][j + 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                } else {
                    //偶数行
                    if (i - 1 >= 0 && j - 1 >= 0 && flags[i - 1][j - 1] && !circleArr[i - 1][j - 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i - 1 >= 0 && flags[i - 1][j] && !circleArr[i - 1][j].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i - 1 >= 0 && j + 1 <= 8 && flags[i - 1][j + 1] && !circleArr[i - 1][j + 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (j - 1 >= 0 && flags[i][j - 1] && !circleArr[i][j - 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (i + 1 <= 8 && flags[i + 1][j] && !circleArr[i + 1][j].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                    if (j + 1 <= 8 && flags[i][j + 1] && !circleArr[i][j + 1].selected) {
                        distances[i + 'x' + j].dis = 1;
                    }
                }
            }
        }


//        for (var i = 0; i < 9; i++) {
//            for (var j = 0; j < 9; j++) {
//                console.log('11111:', distances[i + 'x' + j].dis, i, j);
//            }
//        }

       for (var loop = 1; loop < 9*9 - blockTotal; loop++) {
            var minDistance = MAX_DISTANCE;
            var chosen = null;
           //找U集合最小值
            for (var i = 0; i < 9; i ++) {
                for (var j = 0; j < 9 ; j++) {
                    if (flags[i][j]) {
                        continue;
                    }
                    if (distances[i + 'x' + j].dis < minDistance) {
                        minDistance = distances[i + 'x' + j].dis;
                        chosen = circleArr[i][j];
                    }
                }
            }

            //从U中到最小值更新
           if (chosen != null) {
               var cX = chosen.indexX;
               var cY = chosen.indexY
               flags[cX][cY] = true;

               if(cY%2 ==0) {
                   //偶数行
                   if(cX-1>=0 && cY-1>=0 && !flags[cX-1][cY-1] && minDistance + 1< distances[(cX-1) + 'x' + (cY-1)].dis){
                       distances[(cX-1) + 'x' + (cY-1)].dis = minDistance + 1;
                   }
                   if(cX-1>=0 && !flags[cX-1][cY] && minDistance + 1<distances[(cX-1) + 'x' + (cY)].dis){
                       distances[(cX-1) + 'x' + (cY)].dis = minDistance + 1;
                   }
                   if(cX-1>=0 && cY+1<=8 && !flags[cX-1][cY+1] && minDistance + 1< distances[(cX-1) + 'x' + (cY+1)].dis){
                       distances[(cX-1) + 'x' + (cY+1)].dis = minDistance + 1;
                   }
                   if(cY-1>=0 && !flags[cX][cY-1] && minDistance + 1<distances[cX + 'x' + (cY-1)].dis){
                       distances[cX + 'x' + (cY-1)].dis = minDistance + 1;
                   }
                   if(cX+1<=8 && !flags[cX+1][cY] && minDistance + 1<distances[(cX+1) + 'x' + cY].dis){
                       distances[(cX+1) + 'x' + cY].dis = minDistance + 1;
                   }
                   if(cY+1<=8 && !flags[cX][cY+1] && minDistance + 1<distances[cX + 'x' + (cY + 1)].dis){
                       distances[cX + 'x' + (cY + 1)].dis = minDistance + 1;
                   }
               } else {
                   //奇数行
                   if(cY-1>=0 && !flags[cX][cY-1] && minDistance + 1<distances[cX + 'x' + (cY - 1)].dis){
                       distances[cX + 'x' + (cY - 1)].dis = minDistance + 1;
                   }
                   if(cX-1>=0 && !flags[cX-1][cY] && minDistance + 1<distances[(cX-1) + 'x' + cY].dis){
                       distances[(cX-1) + 'x' + cY].dis = minDistance + 1;
                   }
                   if(cY+1<=8 && !flags[cX][cY+1] && minDistance + 1<distances[cX + 'x' + (cY + 1)].dis){
                       distances[cX + 'x' + (cY + 1)].dis = minDistance + 1;
                   }
                   if(cX+1<=8 && cY-1>=0 && !flags[cX+1][cY-1] && minDistance + 1<distances[(cX+1) + 'x' + (cY - 1)].dis){
                       distances[(cX+1) + 'x' + (cY - 1)].dis = minDistance + 1;
                   }
                   if(cX+1<=8 && !flags[cX+1][cY] && minDistance + 1<distances[(cX+1) + 'x' + cY].dis){
                       distances[(cX+1) + 'x' + cY].dis = minDistance + 1;
                   }
                   if(cX+1<=8 && cY+1<=8 && !flags[cX+1][cY+1] && minDistance + 1<distances[(cX+1) + 'x' + (cY+1)].dis){
                       distances[(cX+1) + 'x' + cY].dis = minDistance + 1;
                   }
               }

           }




        }

        var returnMin = MAX_DISTANCE;
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (i == 0 || i == 8 || j==0 || j==8) {
                    if (distances[i + 'x' + j].dis < returnMin) {
                        returnMin = distances[i + 'x' + j].dis;
                    }
                }
            }
        }

        return returnMin;

    };


    for (var el in adj) {
        var obj = adj[el];
        var selected = obj.selected;
        var indexX = obj.indexX;
        var indexY = obj.indexY;
        if (!selected) {
            dis = smallDistance(indexX, indexY);
            if (dis < minDistance) {
                minDistance = dis;
                nextX = indexX;
                nextY = indexY;
                flag = el;
            }
        }
    }
    console.log('result is', minDistance)
    if (minDistance == MAX_DISTANCE) {
        return -1;
    } else if (minDistance == 0){
        return 0;
    } else {
        return flag;
    }

    // -1 围住 0 输了 方向：left/right/leftup/leftdown/rightup/rightdown

};
