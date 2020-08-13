'use stict'
var config = {
    canvas: 'konvas',
    canvasParent:'konvas-parent',
    toolBar: 'tool-bar-icons',
    fontSize: 36,
    fontFamily: 'Calibri',
    fontPadding: 10,
    strokeWidth: 12,
    imgPadding: 50,
    maxZoomIn: 1.5,
    maxZoomOut: 0.3,
    pixelRatio: 1,
    minCursorScale: 0.75,
    distPageMovePerMSec: 100,
    pageMoverSize: 50,
    pageMoverThumbSize: 30,
    tools: {
        "select": {
            id:'tool1',
            className: 'fa fa-arrow-up active',
            type: "Select",
            desc: "This is not a tool. You can drag objects after selecting this, also selecting it you deselect any of the tool."
        },
        "pen": {
            id:"tool2", 
            className:"fa fa-pencil", 
            type:"Pencil", 
            desc:"Using this tool you can draw free hand anywhere anythng."
        },
        "eraser": {
            id:"tool3", 
            className:"fa fa-eraser", 
            type:"Eraser", 
            desc:"Using this tool to erase the continous strokes or fills."
        },
        "paint-brush": {
            id:"tool4", 
            className:"fa fa-paint-brush",
            type:"Pain Brush", 
            desc:"Using this tool you can fill color to any closed figure."
        },
        "text": {
            id:"tool5",
            className:"fa fa-font", 
            type:"Text", 
            desc:"Using this tool you can write anything in default font."
        },
        "tick": {
            id:"tool6", 
            className:"fa fa-check", 
            type:"Tick", 
            desc:"Using this tool you can draw the TICK shapes."
        },
        "cross": {
            id:"tool7", 
            className:"fa fa-remove", 
            type:"Cross",
            desc:"Using this tool you can draw the CROSS shapes."
        },
        "line": {
            id:"tool8", 
            className:"fa fa-arrows-h", 
            type:"Line", 
            desc:"Using this tool you can draw LINES."    
        },
        "circle": {
            id:"tool9", 
            className:"fa fa-circle-o", 
            type:"Oval",
            desc:"Using this tool you can draw OVAL shapes."
        },
        "rectangle": {
            id:"tool10", 
            className:"fa fa-square-o", 
            type:"Rectangle", 
            desc:"Using this tool you can pick any of the shape and use them."
        },
        "colors": {
            id:"tool11", 
            className:"fa fa-star-half-o", 
            type:"Colors", 
            desc:"Using this tool you can pick any of the color to draw and fills."
        },
        "save":{
            id:"tool12", 
            className:"fa fa-bookmark", 
            type:"Save", 
            desc:"You can save your changes offline as PNG file."
        },
        "zoom-in": {
            id:"tool13", 
            className:"fa fa-search-plus", 
            type:"Zoom In", 
            desc:"This can be used to zoom in."
        },
        "zoom-out": {
            id:"tool14", 
            className:"fa fa-search-minus", 
            type:"Zoom Out", 
            desc:"This can be used to zoom out."
        },
        "exit": {
            id: "tool15",
            className: "fa fa-trash",
            type: "Exit",
            desc: "You can exit the edit window using this",
        },
        'undo': {
            id: "tool16",
            className: "fa fa-undo",
            type: "Undo",
            desc: "You can undo the changes by taping on it."
        },
        'redo': {
            id: "tool17",
            className: "fa fa-repeat",
            type: "Redo",
            desc: "You can redo the undo changes by taping on it."
        },
        'rotate': {
            id: "tool18",
            className: "fa fa-history",
            type: 'rotate',
            desc: 'You can rotate Image by 90 degrees on each click.'
        }
    },
    toolsUsed: [
        "select", 
        "rotate",
        "zoom-in", 
        "zoom-out",
        "pen",
        "eraser",
        'line',
        "tick",
        "cross",
        "circle",
        "rectangle", 
        "undo",
        "redo",
        "save",
        "exit",
    ],
    TOOLS2ID:{
        "select": "tool1",
        "pen": "tool2",
        "eraser":"tool3",
        "paint-brush": "tool4",
        "text": "tool5",
        "tick": "tool6",
        "cross": "tool7",
        "line": "tool8",
        "circle": "tool9",
        "rectangle": "tool10",
        "colors": "tool11",
        "save": "tool12",
        "zoom-in": "tool13",
        "zoom-out": "tool14",
        "exit": "tool15",
        "undo": "tool16",
        "redo": "tool17",
    },
    ID2TOOLS:{
        "tool1" : "select",
        "tool2" : "pen",
        "tool3" : "eraser",
        "tool4" : "paint-brush",
        "tool5" : "text",
        "tool6" : "tick",
        "tool7" : "cross",
        "tool8" : "line",
        "tool9" : "circle",
        "tool10" : "rectangle",
        "tool11" : "colors",
        "tool12" : "save",
        "tool13" : "zoom-in",
        "tool14" : "zoom-out",
        "tool15" : "exit",
        "tool16" : "undo",
        "tool17" : "redo",
    }
};
export default config;