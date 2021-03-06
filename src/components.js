import React from 'react';
import Konva from 'konva';
import { jsPDF } from 'jspdf';
import * as util from './utils';
import config from './config';
import eraser from './eraser.png';
import pen from './pen.png';
import brush from './brush.png';
import tick from './tick.png';
import cross from './cross.png';
import zoomin from './zoomin.png';
import zoomout from './zoomout.png';
import circle from './circle.png';
import rect from './rectangle.png';
import line from './line.png';


class Konvas extends React.Component {
    constructor(props){
        super(props);
        this.dropMarks = this.dropMarks.bind(this)
        this.getCanvasReady = this.getCanvasReady.bind(this);
        this.changeActiveTool = this.changeActiveTool.bind(this);
        this.changeCursor = this.changeCursor.bind(this);
        this.defaultCursor = this.defaultCursor.bind(this);
        this.syncGraphicsWithCursor = this.syncGraphicsWithCursor.bind(this);
        this.changeCursorIcon = this.changeCursorIcon.bind(this);
        this.getContexToDraw = this.getContexToDraw.bind(this);
        this.getPosOfFancyCursor = this.getPosOfFancyCursor.bind(this);
        this.getPosOfFancyCursorOnMainGroup = this.getPosOfFancyCursorOnMainGroup.bind(this);
        this.downloadKonvas = this.downloadKonvas.bind(this);
        this.startToPaint = this.startToPaint.bind(this);
        this.dropShape = this.dropShape.bind(this);
        this.isTouchMove = false;
        this.handleOtherToolEvents = this.handleOtherToolEvents.bind(this);
        this.revokeAllEvents = this.revokeAllEvents.bind(this);
        this.removeActiveTool = this.removeActiveTool.bind(this);
        this.boundImgToStage = this.boundImgToStage.bind(this);
        this.zoom = this.zoom.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this._undoRedo = new util.UndoRedo();
        this._pageMover = new util.PageMover();
        this.totM = 0;
        this.state = {
            activeToolId: "tool1",
            scale: 1,
        };
        this.activeColor = "red";
        this.canPaint = false;
        this.canDropShape = false;
        this.strokeWidth = 7;
        this.lastPointerPosOfFancyCursor = {
            x: 0,
            y: 0,
        };
        this.imgH = 0;
        this.imgW = 0;
        // for rectangle
        this.drawH = 100;
        this.drawW = 300;
        // for circle
        this.drawRX = 150;
        this.drawRY = 75;
        this._activeTool = undefined;
        this._selectionRect = undefined;
        this._stage = util.getStage(config.canvas, this.props.height, this.props.width, false);
        this._mainLayer = new Konva.Layer({
            id: "main-layer",
            name: "mainLayer",
        });
        this._cursorLayer = new Konva.Layer({
            id: 'cursor-layer',
            name: 'cursorLayer',
        });
        this._stage.add(this._mainLayer);
        this._stage.add(this._cursorLayer);
        this._mainGroup = undefined;
        this._context2D = undefined;
    }

    undo(){
        var obj = this._undoRedo.undo();
        if(obj!==-1){
            obj.remove();
            this._mainLayer.batchDraw();
        }
    }

    redo(){
        var obj = this._undoRedo.redo();
        if(obj !== -1){
            this._mainGroup.add(obj);
            this._mainLayer.draw(obj);
        }
    }

    dropMarks(){
        var pos = this._mainGroup.absolutePosition();
        console.log(pos);
        var textNode = util.getSimpleText({x: -pos.x+this._stage.width()/4, y: -pos.y+this._stage.height()/4, color: 'red', text: 'Marks'});
        this._mainGroup.add(textNode);
        this._mainLayer.batchDraw();
        var textarea = document.createElement('input');
        textarea.type = 'number';
        textNode.on('dblclick', () => {
            var textPosition = textNode.getAbsolutePosition();
            var stageBox = this._stage.container().getBoundingClientRect();
            var areaPosition = {
              x: stageBox.left + textPosition.x,
              y: stageBox.top + textPosition.y,
            };
            document.body.appendChild(textarea);
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = textNode.width();
            textarea.style.width = 100 + 'px';
            textarea.focus();
            textarea.onblur = (event)=>{
                textNode.text(textarea.value);
                this.totM += parseInt(textarea.value);
                textNode.fontSize(96);
                textNode.strokeWidth(32);
                textNode.draggable(true);
                this._mainLayer.batchDraw();
                document.body.removeChild(textarea);
            };
        });

    }

    handleOtherToolEvents(tool){
        // incomplete function yet
        if(tool==='select'){
            if(this._selectionRect === undefined){
                this._selectionRect = util.getRect(0, 0, 0, 0, "rgba(0,0,255,0.25)", "rgba(0,0,255,1)")
                this._selectionRect.visible(false);
            }
            this._cursorLayer.add(this._selectionRect);
            var x1, x2, y1, y2;
            // this._stage.on("mousedown touchstart", (event)=>{
            this._stage.on("dblclick dbltap", (event)=>{
                // this._mainGroup.draggable(false);
                x1 = this._stage.getPointerPosition();
                x2 = x1.x;
                y1 = x1.y;
                y2 = x1.y;
                x1 = x2;
                this._selectionRect.height(0);
                this._selectionRect.width(0);
                this._selectionRect.visible(true);
                this._cursorLayer.batchDraw();
            });
            this._stage.on("mousemove touchmove", (event)=>{
                if(!this._selectionRect.visible()){
                    return;
                }
                x2 = this._stage.getPointerPosition();
                y2 = x2.y;
                x2 = x2.x;
                this._selectionRect.setAttrs({
                    x: Math.min(x1, x2),
                    y: Math.min(y1, y2),
                    width: Math.abs(x2 - x1),
                    height: Math.abs(y2 - y1),
                });
                this._cursorLayer.batchDraw();
            });
            this._stage.on('mouseup touchend', (event)=>{
                // this._mainGroup.draggable(true);
                if (!this._selectionRect.visible()) {
                    return;
                  }
                  // update visibility in timeout, so we can check it in click event
                  setTimeout(() => {
                    this._selectionRect.visible(false);
                    this._cursorLayer.batchDraw();
                  });
          
                  var shapes = this._stage.find('.rect').toArray();
                  var box = this._selectionRect.getClientRect();
                  var selected = shapes.filter((shape) =>
                    Konva.Util.haveIntersection(box, shape.getClientRect())
                  );
                //   tr.nodes(selected);
                //   layer.batchDraw();
            });    
        }
    }

    downloadKonvas(){
        this._mainGroup.scale({
            x: 1,
            y: 1
        });
        this._mainGroup.x(0);
        this._mainGroup.y(0);
        this._mainLayer.draw();
        var pdf = new jsPDF('p', 'mm', 'a4', true); 
        var h = 0;
        var dataUrl;
        var firstItr = true;
        var txt;
        this._mainGroup.children.each((child)=>{
            if(child.image !== undefined){
                dataUrl = this._mainGroup.toDataURL({
                    pixelRatio: 0.35,
                    x: 0,
                    y: h,
                    height: child.height(),
                    width: child.width() 
                });
                h += child.height();
                if(firstItr){
                    txt = "QUESTION :- "
                    firstItr = false;
                }
                else{
                    txt = "ANSWER :-"
                    pdf.addPage();
                }
                pdf.text(txt, 7, 7);
                pdf.addImage(dataUrl, "PNG", 8, 8, 194, 280, undefined, 'FAST');
            }
        });
        pdf.save('stage.pdf');
        this.props.exitFunc(this.totM);//dataUrl);
    }

    getContexToDraw(){
        var canvas = document.createElement('canvas');
        canvas.width = this.imgW;
        canvas.height = this.imgH;        
        var canvasImg = util.getImage(0, 0, canvas);
        this._mainGroup.add(canvasImg);
        var _context = canvas.getContext('2d');
        _context.lineJoin = 'round';
        _context.strokeStyle = this.activeColor;
        _context.lineWidth = this.strokeWidth;
        _context.tension = 1;
        return _context;
    }


    getPosOfFancyCursor(){
        var relativePos = this._stage.getPointerPosition();
        var tool = config.ID2TOOLS[this.state.activeToolId];
        var X = this._activeTool.height(); 
        var Y = this._activeTool.width();
        if(tool === "pen" || tool === "eraser" || tool === "paint-brush"){
            X = X/5;
            Y = 4*Y/5;
        }
        else{
            X = X/2;
            Y = Y/2;
        }
        relativePos = {
            x: relativePos.x - X * Math.max(config.minCursorScale, this.state.scale),
            y: relativePos.y - Y * Math.max(config.minCursorScale, this.state.scale)
        }
        return relativePos;
    }

    getPosOfFancyCursorOnMainGroup(){
        var relativePos = this._stage.getPointerPosition();
        relativePos = {
            x: (relativePos.x - this._mainGroup.x())/this.state.scale,
            y: (relativePos.y - this._mainGroup.y())/this.state.scale
        };
        return relativePos;
    }

    syncGraphicsWithCursor(){
        var obj = this._activeTool;
        var pos = this.getPosOfFancyCursor();
        obj.x(pos.x);
        obj.y(pos.y);
        this._cursorLayer.batchDraw();
    }

    dropShape(){
        var shape = config.ID2TOOLS[this.state.activeToolId];
        var shapeObj = undefined;
        var pos = this.getPosOfFancyCursorOnMainGroup();
        switch(shape){
            case "line":
                shapeObj = util.getZigZagLine(pos.x, pos.y, this.activeColor, this.strokeWidth);
                break;
            case "circle":
                shapeObj = util.getHollowCircle(pos.x, pos.y, this.drawRX, this.drawRY, this.activeColor, this.strokeWidth);
                break;
            case "rectangle":
                shapeObj = util.getHollowRect(pos.x, pos.y, this.drawH, this.drawW, this.activeColor, this.strokeWidth);
                break;
            case "tick":
                shapeObj = util.getTick(pos.x, pos.y, this.activeColor, this.strokeWidth);
                break;
            case "cross":
                shapeObj = util.getCross(pos.x, pos.y, this.activeColor, this.strokeWidth);
                break;
            default:
                break;
        }
        this._undoRedo.insert(shapeObj);
        this._mainGroup.add(shapeObj);
        this._mainLayer.batchDraw();
    }

    startToPaint(){
        if(this._context === undefined){
            this._context = this.getContexToDraw();
        }
        if(this.state.activeToolId === config.TOOLS2ID["pen"]){
            this._context.globalCompositeOperation = 'source-over';
            this._context.strokeWidth = 10;
        }
        else if(this.state.activeToolId === config.TOOLS2ID["eraser"]){
            this._context.globalCompositeOperation = 'destination-out';
            this._context.strokeWidth = 30;
        }
        this._context.beginPath();
        var prevPos = this.lastPointerPosOfFancyCursor;
        var pos = this.getPosOfFancyCursorOnMainGroup();
        this.lastPointerPosOfFancyCursor = pos;
        this._context.moveTo(prevPos.x, prevPos.y);
        this._context.lineTo(pos.x, pos.y);
        this._context.closePath();
        this._context.stroke();
        this._mainLayer.batchDraw();
    }

    changeCursorIcon(icon_url, tool){
        this.loadImage(icon_url).then(
            (icon)=>{
                icon.scaleX(Math.max(config.minCursorScale, this.state.scale));
                icon.scaleY(Math.max(config.minCursorScale, this.state.scale));
                icon.x(10);
                icon.y(10);
                this._activeTool = icon;
                this._stage.on('mousemove touchmove tap dragmove', (event)=>{
                    this.syncGraphicsWithCursor();
                    var pos1 = this._pageMover.getPosition();
                    var pos2 = this.getPosOfFancyCursor();
                    var d = Math.sqrt(Math.pow(pos1.x-pos2.x, 2)+Math.pow(pos1.y-pos2.y, 2));
                    if(d<=2*config.pageMoverSize && !this._pageMover.isCursorOn){
                        this._activeTool.remove();
                        this.revokeAllEvents(false);
                        this._stage.container().style.cursor = 'auto';
                        this._cursorLayer.batchDraw();
                        this._pageMover.isCursorOn = true;
                    }
                    if(d>2*config.pageMoverSize 
                        && !this._pageMover.isActive 
                        && this._pageMover.isCursorOn){
                            this._cursorLayer.add(this._activeTool);
                            this._stage.container().style.cursor = 'none';
                            this._cursorLayer.batchDraw();
                            this._pageMover.isCursorOn = false;
                        }
                });
                this._stage.on('mouseleave', event =>{
                    this.revokeAllEvents(false);
                })
                this._cursorLayer.add(icon);
                this._cursorLayer.draw();
            }
        ).then(()=>{
            if (tool === 'pen' || tool === 'eraser') {
                this._stage.on("mousedown", event => {
                    this.canPaint = true;
                    this.lastPointerPosOfFancyCursor = this.getPosOfFancyCursorOnMainGroup();
                });
                this._stage.on("mousemove", event => {
                    if (this.canPaint === true) {
                        this.startToPaint();
                    }
                    
                });
                this._stage.on("mouseup", event => {
                    this.canPaint = false;
                });
                this._stage.on("touchstart dragstart touchmove dragmove", event=>{
                    if(!this.isTouchMove){
                        this.lastPointerPosOfFancyCursor = this.getPosOfFancyCursorOnMainGroup();
                        this.isTouchMove = true;
                    }
                    this.startToPaint();
                })
                this._stage.on("touchend dragend", event=>{
                    this.isTouchMove = false;
                })
            } 
            else if (tool === 'tick' || tool === 'cross' || tool === 'circle' || tool === 'rectangle' || tool === 'line') {
                this._activeTool.on("mousemove", event => {
                    this.canDropShape = true;
                });
                
                this._activeTool.on("mouseup", event => {
                    if (this.canDropShape === true) {
                        this.dropShape();
                        this.canDropShape = false;
                    }
                });
                this._stage.on('touchend dragend tap', event=>{
                    this.dropShape();
                })
            } 
            else if (tool === "zoom-in" || tool === "zoom-out") {
                this._stage.on("mouseup touchend dragend tap", event => {
                    var deltaScale = tool === "zoom-in" ? 0.10 : -0.10;
                    var newScale = this.state.scale + deltaScale;
                    if (newScale >= config.maxZoomOut && newScale <= config.maxZoomIn) {
                        this.setState({
                            scale: newScale
                        });
                    }
                });
            }
        });
    }


    changeCursor(){
        var tool = config.ID2TOOLS[this.state.activeToolId];
        var cursor = "auto";
        var cImg = undefined;
        switch(tool){
            case "select":
                cursor = 'pointer';
                break;
            case "pen":
                cursor = 'none';
                cImg = pen;
                break;
                
            case "eraser":
                cursor = 'none';
                cImg = eraser;
                break;
                
            case "paint-brush":
                cursor = 'none';
                cImg = brush;
                break;
            
            case "tick":
                cursor = 'none';
                cImg = tick;
                break;
                
            case "cross":
                cursor = 'none';
                cImg = cross;
                break;
                
            case "line":
                cursor = 'none';
                cImg = line;
                break;
            
            case "circle":
                cursor = 'none';
                cImg = circle;
                break;
                
            case "rectangle":
                cursor = 'none';
                cImg = rect;
                break;
            
            case "zoom-in":
                cursor = 'none';
                cImg = zoomin;
                break;
                
            case "zoom-out":
                cursor = 'none';
                cImg = zoomout;
                break;
            
            default:
                cursor = "auto";  
                // this._mainGroup.draggable(true);
        }
        if(cursor === "none"){
            this.changeCursorIcon(cImg, tool);
            // this._mainGroup.draggable(false);
        }
        else{
            this.handleOtherToolEvents(tool);
            // this._cursorLayer.batchDraw();
        }
        this._stage.container().style.cursor = cursor;
    }

    revokeAllEvents(strictly){
        this.canPaint = false;
        this.canDropShape = false;
        this.isTouchMove = false;
        if(strictly){
            this._stage.off('dblclick click dbltap tap mouseup mousedown touchstart touchend dragstart dragend mousemove touchmove dragmove');
        }
    }
    removeActiveTool(){
        if(this._activeTool !== undefined){
            this._activeTool.remove();
        }
        this._activeTool = undefined;
        this._cursorLayer.destroyChildren();
        this._cursorLayer.batchDraw();
    }

    changeActiveTool(id){
        this.revokeAllEvents(true);
        this.removeActiveTool();
        this.setState({
            activeToolId: id
        });
    }

    loadImage(url){
        return new Promise((resolve, reject)=>{
            var imageObj = new Image();
            imageObj.onload = function (event) {
                imageObj = util.getImage(0, 0, imageObj, this.height, this.width);
                resolve(imageObj);
            };
            imageObj.onerror = (err)=>{
                reject(err);
            }
            imageObj.src = url;
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(prevState.activeToolId !== this.state.activeToolId){
            this.changeCursor();
        }
        if(prevState.scale !== this.state.scale){
            this.zoom(prevState.scale);
        }
    }

    zoom(oldScale){
        var __scale = this.state.scale;
        var pos = this.getPosOfFancyCursor();
        var actualPointerPos = {
            x: (pos.x - this._mainGroup.x())/oldScale,
            y: (pos.y - this._mainGroup.y())/oldScale
        };
        this._mainGroup.scale({
            x: __scale,
            y: __scale
        })
        this._activeTool.scale({
            x: Math.max(config.minCursorScale, __scale),
            y: Math.max(config.minCursorScale, __scale)
        });
        var adjustedScaledPos = {
            x: pos.x - actualPointerPos.x * __scale,
            y: pos.y - actualPointerPos.y * __scale
        }
        this._mainGroup.position(adjustedScaledPos);
        this._mainLayer.batchDraw();
        this._cursorLayer.batchDraw();
    }


    boundImgToStage(pos){
        let x = pos.x, y = pos.y;
        let pad = config.imgPadding/this.state.scale;
        var imgH_ = this.props.height - this.imgH*this.state.scale - pad;
        var imgW_ = this.props.width - this.imgW*this.state.scale - pad;
        x = x>pad?pad:x<imgW_?imgW_:x;
        y = y>pad?pad:y<imgH_?imgH_:y;
        return {
            x: x,
            y: y
        }
    }

    getCanvasReady(){
        var imgPos = {x: 0, y: 0};
        this._mainGroup = util.getGroup({x: 0, y: 0, draggable: false, name: "main-group"});
        return new Promise(async (resolve, reject)=>{
            this.props.imgUrl.forEach(async (url, index)=>{
                await this.loadImage(url)
                .then((imageObj)=>{
                    this.imgH += imageObj.height();
                    this.imgW = Math.max(this.imgW, imageObj.width());
                    imageObj.position(imgPos);
                    this._mainGroup.add(imageObj);
                    this._mainGroup.add(util.getSimpleText({
                        x: imgPos.x,
                        y: imgPos.y,
                        text: 'Answer Sheet No. '+(index+1),
                        color: 'black',
                    }))
                    imgPos = {
                        x: 0,
                        y: this.imgH,
                    }
                    if(index === this.props.imgUrl.length-1){
                        resolve(this._mainGroup);
                    }
                })
                .catch((error)=>{
                    reject(error);
                })
            });
        });
    }

    addSomeBasicClickEventsOnTools(){
        var markingId = config.TOOLS2ID["marking"];
        var markingEle = document.getElementById(markingId);
        markingEle.onclick = this.dropMarks;
        var saveId = config.TOOLS2ID["save"];
        var saveEle = document.getElementById(saveId);
        saveEle.onclick = this.downloadKonvas;
    }

    componentDidMount(){ 
        this.getCanvasReady()
        .then((group)=>{
            var pgMvr = this._pageMover.getPageMover(this._stage.width()-100, this._stage.height()-100);
            this._mainLayer.add(group);
            this._mainLayer.add(pgMvr);
            this._pageMover.addEventsToPageMover(this._mainGroup.name(), this.boundImgToStage);
            this._undoRedo.addUndoRedoEvents(this.undo, this.redo);
            this.addSomeBasicClickEventsOnTools();
            this.changeCursor();
            this._mainLayer.draw();
        })
        .catch((error)=>{
            console.log(error);
        });
    }
    componentWillUnmount(){
        this._stage.destroyChildren();
        this._stage.remove();
    }

    defaultCursor(){
        this._stage.container().style.cursor = "auto";
    }

    render(){
        return (
            <this.props.toolBar active={this.state.activeToolId} changeTool={this.changeActiveTool} downloadKonvas={this.downloadKonvas} defaultCursor={this.defaultCursor}/>
        );
    }
}


class ToolBar extends React.Component{
    constructor(props){
        super(props);
        this.showTutorial = false;
        this.status = {};
        config.toolsUsed.forEach((tool)=>{
           this.status[config.TOOLS2ID[tool]] = true; 
        });
        this.handleClick = this.handleClick.bind(this);
        this.createClickOn = this.createClickOn.bind(this);
    }

    componentDidMount(){
        var ele = document.getElementById('tutorial');
        ele.onchange = ()=>{
            this.showTutorial = ele.checked;
        }
        this.createClickOn("#check-box")
    }

    createClickOn(href){
        var a = document.createElement('a');
        a.href = href;
        // a.click();
        a.remove();
    }

    handleClick(event){
        var ele = document.getElementById(this.props.active);
        var id = event.target.id;
        if(ele !== event.target){
            ele.classList.remove('active');
            event.target.classList.add('active');
            if(this.showTutorial && this.status[id]){
                this.props.defaultCursor();
                this.createClickOn("#modal-"+id)
                this.status[id] = false;
            }
            else{
                this.props.changeTool(id);
            }
        }
    }
    render(){
        var tools = config.tools;
        var ToolBtns = config.toolsUsed.map((tool)=>
            <ButtonContainer key={tools[tool].id} onClick={this.handleClick} id={tools[tool].id} className={tools[tool].className} type={tools[tool].type} desc={tools[tool].desc} />   
        );
        return (
            <div className="tool-bar">
                {ToolBtns}
                <div id="addons">
                    <input type="checkbox" id="tutorial" hidden/>
                    <InputModal id="check-box" icon="fa fa-superpowers" type="Tutorial" desc="Do you want a tutorial popup before every first tap on any tool?" />
                </div>
            </div>
        );
    };
}

function ButtonWithTutorial(props){
    props = props.props;
    var modalid = "modal-"+props.id;
    return (
        <div>
        <button onClick={props.onClick} id={props.id} className={props.className}></button>
        <InfoModal id={modalid} icon={props.className} type={props.type} desc={props.desc} />
        </div>
    );

}

function ButtonContainer(props){
    var content = (
        <div className="button-container">
            <ButtonWithTutorial props={props} />
        </div>
    );
    return content;
}

function InfoModal(props){
    function closeInfoModal(){
        var a = document.createElement('a');
        a.href = "#";
        a.click();
        a.remove();
    }
    return (
        <div id={props.id} onBlur={closeInfoModal} className="modal-window">
            <div>
                <a href="#" title="Close" className="modal-close">Close</a>
                <h1>{props.type}<i style={{paddingLeft: 0.25 + 'em'}} className={props.icon}></i></h1>
                <div>{props.desc}</div>
            </div>
        </div>
    )
}


function InputModal(props){
    function handleYes(){
        var ele = document.getElementById('tutorial');
        ele.click();
        // ele.checked = true;
        closeIpModal();
    }
    function closeIpModal(){
        var a = document.createElement('a');
        a.href = "#";
        a.click();
        a.remove();
    }
    return (
        <div id={props.id} className="modal-window">
            <div>
                <h1>{props.type}<i style={{paddingLeft: 0.25 + 'em'}} className={props.icon}></i></h1>
                <div>{props.desc}</div>
                <div className="check-box" onClick={handleYes}>Yes</div>
                <div className="check-box" onClick={closeIpModal}>No</div>
            </div>
        </div>
    )
}


export{
    ToolBar,
    Konvas,
    InfoModal,
    InputModal,
}