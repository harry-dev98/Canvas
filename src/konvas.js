import React from 'react';
import * as comp from './components';

class KonvasPackage extends React.Component{
    render(){
        return (
            <comp.Konvas height={this.props.height} width={this.props.width} fname={this.props.fname} imgUrl={this.props.img} toolBar={comp.ToolBar} />
        );
    }
}

export default KonvasPackage;