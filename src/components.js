import React from 'react';
import Konva from 'konva';
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
        this.changeActiveTool = this.changeActiveTool.bind(this);
        this.changeCursor = this.changeCursor.bind(this);
        this.syncGraphicsWithCursor = this.syncGraphicsWithCursor.bind(this);
        this.changeCursorIcon = this.changeCursorIcon.bind(this);
        this.getContexToDraw = this.getContexToDraw.bind(this);
        this.getPostionOfDraw = this.getPostionOfDraw.bind(this);
        this.downloadKonvas = this.downloadKonvas.bind(this);
        this.startToPaint = this.startToPaint.bind(this);
        this.state = {
            activeToolId:"tool1",
            activeColor:"red",
            canPaint: false,
            strokeWidth: 7,
            lastPointerPos: {
                x: 0,
                y: 0,
            },
        }
        this.imgH = 0;
        this.imgW = 0;
        this._activeTool = "";
        this._stage = util.getStage(config.canvas, this.props.height, this.props.width, false);
        this._mainLayer = new Konva.Layer({
            id: "main-layer",
            name: "mainLayer",
        });
        this._cursorLayer = new Konva.Layer({
            id: 'cursor-layer',
            name: 'cursorLayer',
        });
        // this._layer = new Konva.Layer();
        this._stage.add(this._mainLayer);
        // this._stage.add(this._layer);
        this._stage.add(this._cursorLayer);
        this._mainGroup = "";
        // this._group = "";
        this._context2D = "";
        console.log('constructor');
    }

    downloadKonvas(){
        this._mainGroup.x(0);
        this._mainGroup.y(0);
        this._mainLayer.draw();
        var dataUrl = this._stage.toDataURL({
            pixelRatio: 1,
        });
        var link = document.createElement('a');
        link.href = dataUrl;
        link.download = this.props.fname;
        // link.click();
        link.remove();
    }

    getContexToDraw(){
        var canvas = document.createElement('canvas');
        canvas.width = this._stage.width();
        canvas.height = this._stage.height();
        var canvasImg = util.getImage(0, 0, canvas);
        this._mainGroup.add(canvasImg);
        var _context = canvas.getContext('2d');
        _context.lineJoin = 'round';
        _context.strokeStyle = this.state.activeColor;
        _context.lineWidth = this.state.strokeWidth;
        _context.tension = 1;
        return _context;
    }

    getPostionOfDraw(){
        var relativePos = this._stage.getPointerPosition();
        this.setState({
            lastPointerPos: relativePos,
        })
        return relativePos;
    }

    syncGraphicsWithCursor(){
        var pos = this.getPostionOfDraw();
        var obj = this._activeTool;
        pos = {
            x: pos.x - obj.height(),
            y: pos.y - obj.width()
        }
        obj.x(pos.x);
        obj.y(pos.y);
        this._cursorLayer.batchDraw();
    }

    startToPaint(){
        if(this.state.activeToolId === config.TOOLS2ID["pen"]){
            this._context.globalCompositeOperation = 'source-over';
        }
        else if(this.state.activeToolId === config.TOOLS2ID["eraser"]){
            this._context.globalCompositeOperation = 'destination-out';
        }
        this._context.beginPath();
        var prevPos = this.state.lastPointerPos;
        var pos = this.getPostionOfDraw();
        console.log(pos);
        prevPos = {
            x: prevPos.x + this._activeTool.height() + this._mainGroup.x(),
            y: prevPos.y + this._activeTool.width() + this._mainGroup.y(),
        };
        this._context.moveTo(prevPos.x, prevPos.y);
        pos = {
            x: pos.x + this._activeTool.height() + this._mainGroup.x(),
            y: pos.y + this._activeTool.width() + this._mainGroup.y(),
        };
        this._context.lineTo(pos.x, pos.y);
        this._context.closePath();
        this._context.stroke();
        this._mainLayer.batchDraw();
    }

    changeCursorIcon(icon_url){
        this.loadImage(icon_url).then(
            (icon)=>{
                icon.scaleX(1.5);
                icon.scaleY(1.5);
                icon.x(this.props.height/2);
                icon.y(this.props.width/2);
                this._activeTool = icon;
                this._stage.on('mousemove touchmove', (event)=>{
                    this.syncGraphicsWithCursor();
                });
                this._cursorLayer.add(icon);
                this._cursorLayer.draw();
            }
        ).then(
            ()=>{
                var tool = config.ID2TOOLS[this.state.activeToolId];
                if(tool === 'pen' || tool === 'eraser'){
                    this._activeTool.on("mousedown touchstart", (event)=>{
                        // console.log("activetool mousedown touchstart");
                        this.setState({
                            canPaint: true
                        });
                    });
                    this._activeTool.on("mousemove touchmove", (event)=>{
                        // console.log("activetool mousemove touchmove");
                        if(this.state.canPaint===true){
                            this.startToPaint();
                        }
                    });
                    this._activeTool.on("mouseup touchend", (event)=>{
                        // console.log("activetool mouseend touchend");
                        this.setState({
                            canPaint: false
                        });
                    });
                }
                if(tool === 'tick' || tool === 'cross' ||
                tool === 'square' || tool === 'rectangle' ||
                tool === 'line'){
                    this._activeTool.on("mousedown touchstart", (event)=>{
                        console.log("activetool mousedown touchstart");
                        this.setState({
                            canPaint: true
                        });
                    });
                    this._activeTool.on("mousemove touchmove", (event)=>{
                        console.log("activetool mousemove touchmove");
                        if(this.state.canPaint===true){
                            this.startToPaint();
                        }
                    });
                    this._activeTool.on("mouseup touchend", (event)=>{
                        console.log("activetool mouseend touchend");
                        this.setState({
                            canPaint: false
                        });
                    });
                }
            }
        );
    }

    changeCursor(id){
        var cursor = "auto";
        var cImg = "";
        if((id === "tool1" || id === "tool2") && this._context === undefined){
            this._context = this.getContexToDraw();
        }
        switch(id){
            case "tool2":
                cursor = 'none'
                cImg = pen;
                break;
                
            case "tool3":
                cursor = 'none';
                cImg = eraser;
                break;
                
            case "tool4":
                cursor = 'none'
                cImg = brush;
                break;
            
            case "tool6":
                cursor = 'none'
                cImg = tick;
                break;
                
            case "tool7":
                cursor = 'none';
                cImg = cross;
                break;
                
            case "tool8":
                cursor = 'none'
                cImg = line;
                break;
            
            case "tool9":
                cursor = 'none';
                cImg = circle;
                break;
                
            case "tool10":
                cursor = 'none'
                cImg = rect;
                break;
            
            case "tool13":
                cursor = 'none';
                cImg = zoomin;
                break;
                
            case "tool14":
                cursor = 'none'
                cImg = zoomout;
                break;
                
            default:
                cursor = "auto";  
                this._mainGroup.draggable(true);
        }
        if(cursor==="none"){
            this.changeCursorIcon(cImg);
            this._mainGroup.draggable(false);
        }
        this._stage.container().style.cursor = cursor;
    }

    changeActiveTool(id){
        this._stage.off('mousemove touchmove');
        this._cursorLayer.removeChildren();
        this._cursorLayer.batchDraw();
        this.setState({
            activeToolId:id,
        });
        this.changeCursor(id);
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
        })
    }

    componentDidMount(){
        this.loadImage(this.props.imgUrl).then(
            (imageObj)=>{
            this.imgH = imageObj.height()*config.scale;
            this.imgW = imageObj.width()*config.scale;
            this._mainGroup = util.getGroup(0, 0, true, (pos)=>{
                let x = pos.x, y = pos.y;
                let pad = config.imgPadding;
                // bound the coordinates between
                // -(imageSize+Padding-stageSize) to Padding
                var imgH_ = this.props.height - this.imgH - pad;
                var imgW_ = this.props.width - this.imgW - pad;
                x = x>pad?pad:x<imgW_?imgW_:x;
                y = y>pad?pad:y<imgH_?imgH_:y;
                return {
                    x: x,
                    y: y
                };
            });
            this._mainGroup.add(imageObj);
            this._mainLayer.add(this._mainGroup);
            this._mainLayer.draw();
            this._stage.height(this.imgH);
            this._stage.width(this.imgW);
        });
        console.log("component mounted");
    }
    componentWillUnmount(){
        this._stage = undefined;
    }
    
    zoomin(){
        console.log("zoomin");
    }

    render(){
        return (
            <this.props.toolBar active={this.state.activeToolId} changeTool={this.changeActiveTool} downloadKonvas={this.downloadKonvas}/>
        );
    }
}

class ToolBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showTutorial: false,
            status: {
                "tool1": true,
                "tool2": true,    
                "tool3": true,
                "tool4": true,
                "tool5": true,
                "tool6": true,
                "tool7": true,
                "tool8": true,
            }
        }
        console.log("constructor ready!");
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
        var ele = document.getElementById('tutorial');
        ele.onchange = ()=>{
            console.log("ele changes");
            this.setState({showTutorial:ele.checked});
        }
        var a = document.createElement('a');
        a.href = "#check-box";
        a.click();
        a.remove();
        console.log("here");
    }

    handleClick(event){
        var ele = document.getElementById(this.props.active);
        var id = event.target.id;
        if(ele !== event.target){
            ele.classList.remove('active');
            event.target.classList.add('active');
            var _status = this.state.status;
            //ensuring tutorials are popped only once
            if(this.state.showTutorial && _status[id]){
                var a = document.createElement('a');
                a.href = "#modal-"+id;
                a.click();
                a.remove();
            }
            _status[id] = false;
            this.setState({
                status: _status 
            });
            this.props.changeTool(id);
        }
        
        if(id === "tool12"){
            this.props.downloadKonvas();
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
        <>
        <button onClick={props.onClick} id={props.id} className={props.className}></button>
        <InfoModal id={modalid} icon={props.className} type={props.type} desc={props.desc} />
        </>
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