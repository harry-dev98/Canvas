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
        var _obj = this._redoStack.pop();
        // console.log(_obj);
        if(_obj !== -1){
            this._undoStack.push(_obj);
            return _obj;
        }
        return -1;
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


function getCross(x, y, color, width){
    x -= 50;
    y -= 50;
    var l1Points = [x+0, y+0, x+100, y+100]
    var l2Points = [x+0, y+100, x+100, y+0];
    var group = getGroup(0, 0, true, (pos)=>{
        return pos;
    });
    var l1 = getLine(l1Points, color, width);
    var l2 = getLine(l2Points, color, width);
    group.add(l1);
    group.add(l2);
    return group;
}


function getTick(x, y, color, width){
    x -= 75
    var l1Points = [x+0, y+0, x+30, y+25]
    var l2Points = [x+30, y+25, x+150, y-50];
    var group = getGroup(0, 0, true, (pos)=>{
        return pos;
    });
    var l1 = getLine(l1Points, color, width);
    var l2 = getLine(l2Points, color, width);
    group.add(l1);
    group.add(l2);
    return group;
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

function getGroup(x, y, draggable, boundFunc){
    return new Konva.Group({
        x: x,
        y: y,
        draggable: draggable,
        dragBoundFunc: boundFunc,
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
    UndoRedo,
}