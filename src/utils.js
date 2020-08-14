import Konva from 'konva'
import config from './config'

class Stack{
    constructor(){
        this.objList = [];
        this.ptr = -1;
    }
    isEmpty(){
        return this.ptr === -1;
    }
    peek(){
        return this.isEmpty()?-1:this.objList[this.ptr];
    }
    push(obj){
        this.ptr++;
        this.objList[this.ptr] = obj;
    }
    pop(){
        if(this.isEmpty()){
            return -1;
        }
        var __tmp = this.objList[this.ptr];
        delete this.objList[this.ptr];
        this.ptr--;
        return __tmp;
    }
    renew(){
        delete this.objList;
        this.objList = [];
        this.ptr = -1;
    }
}

class UndoRedo{
    constructor(){
        this._undoStack = new Stack();
        this._redoStack = new Stack();
    }
    
    addUndoRedoEvents(undo, redo){
        var undoId = config.TOOLS2ID["undo"];
        var redoId = config.TOOLS2ID["redo"];
        var undoEle = document.getElementById(undoId);
        var redoEle = document.getElementById(redoId);
        undoEle.onclick = undo;
        redoEle.onclick = redo;
    }

    insert(obj){
        this._undoStack.push(obj);
        this._redoStack.renew();
    }

    remove(obj){
        this._redoStack.push(obj);
        var __popedObj;
        while(!this._undoStack.isEmpty() && this._undoStack.peek() !== obj){
            __popedObj= this._undoStack.pop();
            this._redoStack.push(__popedObj)
        }
        __popedObj = this._undoStack.pop();
        while(this._redoStack.peek() !== obj){
            __popedObj = this._redoStack.pop();
            this._undoStack.push(__popedObj)
        }
    }

    undo(){
        var _obj = this._undoStack.pop();
        if(_obj !== -1){
            this._redoStack.push(_obj);
            return _obj;
        }
        return -1;
    }

    redo(){
        var _obj = this._redoStack.pop()
        if(_obj !== -1){
            this._undoStack.push(_obj);
            return _obj;
        }
        return -1;
    }
}

class PageMover{
    constructor(){
        // this.getPostition = this.getPostition.bind(this);
        this.pageMover = undefined;
        this.isActive = false;
        this.isCursorOn = false;
        this.scroller = undefined;
        this.dir = undefined;
        this.pagePos = {
            x: 0,
            y: 0
        }
    }

    getPosition(){
        return this.pageMover.position();
    }

    getPageMover(x, y){
        var group  = getGroup({x:x, y:y, dragable:true, name:"page-mover"});
        var biggerC = getCircle(0, 0, config.pageMoverSize, config.pageMoverSize, '#cccbd2', '#acabb0');
        var smallerC = getCircle(0, 0, config.pageMoverThumbSize, config.pageMoverThumbSize, '#0b0a0a', '#100f0f');
        biggerC.opacity(0.75);
        biggerC.addName("biggerC");
        smallerC.opacity(0.75);
        smallerC.addName("smallerC");
        biggerC.draggable(false);
        group.add(biggerC);
        group.add(smallerC);
        this.pageMover = group;
        return group;
    }

    addEventsToPageMover(mainG, boundImgToStage){
        var __parent = this.pageMover.parent;
        var __sibling;
        __parent.children.each((child)=>{
            if(child.name() === mainG){
                __sibling = child;
            }
        })
        var smC;
        this.pageMover.children.each((child)=>{
            if(child.name() === "smallerC"){
                smC = child;
            }
        });
        smC.dragBoundFunc((pos)=>{
            var _x = this.pageMover.x();
            var _y = this.pageMover.y();
            return {
                x: (pos.x>_x)?Math.min(pos.x, _x+50):Math.max(pos.x, _x-50),
                y: (pos.y>_y)?Math.min(pos.y, _y+50):Math.max(pos.y, _y-50)
            }
        })
        
        smC.on('dragstart dragmove dragend', event=>{
            event.cancelBubble = true;
        })

        var keepScrolling = ()=>{
            var x_, y_;
            switch(this.dir){
                case "R":
                    x_ = 1; y_ = 0;
                    break;
                case "RU":
                    x_ = 1; y_ = -1;
                    break;
                case "U":
                    x_ = 0; y_ = -1;
                    break;
                case "LU":
                    x_ = -1; y_ = -1;
                    break;
                case "L":
                    x_ = -1; y_ = 0;
                    break;
                case "LD":
                    x_ = -1; y_ = 1;
                    break;
                case "D":
                    x_ = 0; y_ = 1;
                    break;
                case "RD":
                    x_ = 1; y_ = 1;
                    break;
                default:
                    x_ = 0; y_ = 0;
            }
            this.scroller = setInterval(()=>{
                var gradient = Math.sqrt(Math.pow(smC.x(), 2)+Math.pow(smC.y(), 2))/50;
                this.pagePos = {
                    x: this.pagePos.x + x_ * config.distPageMovePerMSec * gradient,
                    y: this.pagePos.y + y_ * config.distPageMovePerMSec * gradient
                };
                this.pagePos = boundImgToStage(this.pagePos);
                __sibling.x(this.pagePos.x);
                __sibling.y(this.pagePos.y);
                __parent.batchDraw();
            }, 100);
        }

        smC.on('dragmove', event=>{
            var _x = smC.x();
            var _y = smC.y();
            var dir = undefined;
            var angle = 180 + Math.atan2(-_y, _x)*180 /Math.PI;
            if(337.5 <= angle || angle < 22.5){
                dir = "R";
            }
            else if(22.5 <= angle && angle < 67.5){
                dir = "RU";
            }
            else if(67.5 <= angle && angle < 112.5){
                dir = "U";
            }
            else if(112.5 <= angle && angle < 157.5){
                dir = "LU";
            }
            else if(157.5 <= angle && angle < 202.5){
                dir = "L";
            }
            else if(202.5 <= angle && angle < 247.5){
                dir = "LD";
            }
            else if(247.5 <= angle && angle < 292.5){
                dir = "D";
            }
            else if(292.5 <= angle && angle < 337.5){
                dir = "RD";
            }
            if(this.dir === undefined || this.dir !== dir){
                if(this.isActive){
                    clearInterval(this.scroller);
                }
                this.isActive = true;
                this.dir = dir;
                keepScrolling();
            }
        })
        smC.on('dragend', event=>{
            this.dir = undefined;
            clearInterval(this.scroller);
            this.isActive = false;
            smC.x(0);
            smC.y(0);
            __parent.batchDraw();
        })
    }
}


function getImage(x, y, image, height, width){
    return new Konva.Image({
        x: x,
        y: y,
        image: image,
        height: height,
        width: width,
        scaleX: config.scale,
        scaleY: config.scale,
    });
}

function getStage(id, height, width, draggable, dragDistance, dragBoundFunc){
    return new Konva.Stage({
        container: id,
        width: width,
        height: height,
        draggable: draggable,
        dragDistance: dragDistance,
        dragBoundFunc: dragBoundFunc,
        color: 'black',
        listening: true,
        
    });
}

function getText(text, color){
    return new Konva.Text({
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        text: text,
        fill: color,
        padding: config.fontPadding,
      });
}


function getCircle(x, y, radiusX, radiusY, color, boundryColor){
    return new Konva.Ellipse({
        x: x,
        y: y,
        radiusX: radiusX,
        radiusY: radiusY,
        fill: color,
        stroke: boundryColor,
        strokeWidth: config.strokeWidth,
        draggable: true
        });
}

function getHollowCircle(x, y, radiusX, radiusY, boundryColor){
    return getCircle(x, y, radiusX, radiusY, "", boundryColor);
}

function getMarkingStand({x, y}){
    var l1Points = [x-10, y+20, x+5, y-15];
    var l2Points = [x-10, y+30, x+5, y-25];
    return shapeWith2Lines(l1Points, l2Points, "red", 12);
}

function shapeWith2Lines(l1Points, l2Points, color, width){
    var group = getGroup(0, 0, true, (pos)=>{
        return pos;
    });
    var l1 = getLine(l1Points, color, width);
    var l2 = getLine(l2Points, color, width);
    group.add(l1);
    group.add(l2);
    return group;
}

function getCross(x, y, color, width){
    x -= 50;
    y -= 50;
    var l1Points = [x+0, y+0, x+100, y+100]
    var l2Points = [x+0, y+100, x+100, y+0];
    return shapeWith2Lines(l1Points, l2Points, color, width);
}


function getTick(x, y, color, width){
    x -= 75
    var l1Points = [x+0, y+0, x+30, y+25]
    var l2Points = [x+30, y+25, x+150, y-50];
    return shapeWith2Lines(l1Points, l2Points, color, width);
}

function getZigZagLine(x, y, color, width){
    x -= 200;
    y -= 60;
    var points = [x+80, y+80, x+120, y+40, x+120, 
        y+80, x+160, y+40, x+160, y+80, x+200, 
        y+40, x+200, y+80, x+240, y+40, x+240,
        y+80, x+280, y+40];
    return getLine(points, color, width);
}

function getLine(points, color, width){
    return new Konva.Line({
        points: points,
        stroke: color,
        strokeWidth: width,
        lineCap: 'round',
        lineJoin: 'round', 
    });
}


function getRect(x, y, height, width, color, boundryColor){
    return new Konva.Rect({
        x: x,
        y: y,
        height: height,
        width: width,
        fill: color,
        stroke: boundryColor,
        strokeWidth: config.strokeWidth,
        visible:true,
        draggable: true
    })
}

function getHollowRect(x, y, height, width, boundryColor){
    x -= width/2;
    y -= height/2;
    return getRect(x, y, height, width, "", boundryColor);
}

function getGroup({x, y, draggable, boundFunc, name}){
    return new Konva.Group({
        x: x,
        y: y,
        draggable: draggable,
        dragBoundFunc: boundFunc,
        name: name,
    });
}

function getSimpleText({x, y, text, color}){
    return new Konva.Text({
        x: x,
        y: y,
        text: text,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        padding: config.fontPadding,
        fill: color,
      });
}

export{
    getCircle,
    getHollowCircle,
    getImage,
    getStage,
    getText,
    getRect,
    getHollowRect,
    getGroup,
    getLine,
    getZigZagLine,
    getCross,
    getTick,
    getSimpleText,
    getMarkingStand,
    UndoRedo,
    PageMover,

}