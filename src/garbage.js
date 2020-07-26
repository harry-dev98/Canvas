var blueGroup = util.getGroup(30, 70, true, (pos)=>{
    var newY = pos.y < 50 ? 50 : pos.y;
    return {
        x: pos.x,
        y: newY,
    };
});

// bound inside a circle
var yellowGroup = util.getGroup(400, 70, true, 
(pos)=>{
    var x = 400;
    var y = 70;
    var radius = 50;
    var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
    if (scale < 1)
    return {
        y: Math.round((pos.y - y) * scale + y),
        x: Math.round((pos.x - x) * scale + x),
        };
    else return pos;
    }
);

var blueText = util.getText('boundBelow', 'black');
var blueRect_ = util.getCircle(blueText.height(), 
                        blueText.width(), 10,
                        '#aaf', 'black');
var blueRect = util.getRect(blueText.height(), 
                        blueText.width(), 
                        '#aaf', 'black');

var yellowText = util.getText('boundInCircle', 'black');

var yellowRect = util.getRect(yellowText.height(), 
                        yellowText.width(), 
                        '#aaf', 'black');
var x  = 10;
blueGroup.on('click', (event)=>{
x+=10;
var c = util.getCircle(x,
blueText.width(), 25,
'#aaf', 'black');
blueGroup.add(c);

})
blueGroup.add(blueRect).add(blueText);
blueGroup.add(blueRect_);
yellowGroup.add(yellowRect).add(yellowText);

this._layer = new Konva.Layer();
this._layer.add(blueGroup);
this._layer.add(yellowGroup);

// add the layer to the stage
this._stage.add(this._layer);



////////////////////////////////////

////////////////////////////////////

///////////////////////////////////


// function fitStageIntoParentContainer(stage) {
        //     var container = document.getElementById('konvas-parent');
        
        //     // now we need to fit stage into parent
        //     var containerWidth = container.offsetWidth;
        //     // to do this we need to scale the stage
        //     var scale = containerWidth / stage.width;
        
        //     stage.width(stage.width * scale);
        //     stage.height(stage.height * scale);
        //     stage.scale({ x: scale, y: scale });
        //     stage.draw();
        //   }
        
        //   fitStageIntoParentContainer(this._stage);
        //   // adapt the stage on any window resize
        //   window.addEventListener('resize', fitStageIntoParentContainer);



////////////////////////////////////

////////////////////////////////////

///////////////////////////////////

// var ele = [
            // {
            //     id: 'tool9',
            //     className: 'fa fa-underline',
            //     type: 'Line',
            //     desc: 'Using this tool you can draw straight lines.'
            // },
            // {
            //     id: 'tool10',
            //     className: 'fa fa-check-square',
            //     type: 'Tick',
            //     desc: 'Using this tool you can draw ticks.'
            // },
        // ];


function ButtonDropUp(props){
    if(props.ele !== undefined){
        var content = props.ele.map((e)=>
            <ButtonWithTutorial key={e.id} props={e}/>
        );
        
        return (
            <>
                {content}
            </>
        )
    }
    return (
        <></>
    )

}
