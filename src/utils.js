import Konva from 'konva'
import config from './config'

function getCircle(x, y, radius, color, boundryColor){
        return new Konva.Circle({
            x: x,
            y: y,
            radius: radius,
            fill: color,
            stroke: boundryColor,
            strokeWidth: config.strokeWidth,
          });
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

function getRect(height, width, color, boundryColor){
    return new Konva.Rect({
        height: height,
        width: width,
        fill: color,
        stroke: boundryColor,
        strokeWidth: config.strokeWidth,
      })
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
    getImage,
    getStage,
    getText,
    getRect,
    getGroup,
}