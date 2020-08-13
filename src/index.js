import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import config from './config'

import img1 from './IMG1.png'; // input via API
import img2 from './IMG2.png'; // input via API
import img3 from './IMG3.png'; // input via API
import KonvasPackage from './konvas';

var img = new Array(img1, img2, img3);

// var konvasParent = document.getElementById('konvas-parent');
// konvasParent.onchange = ()=>{
  ReactDOM.render(
    // <React.StrictMode>
      <KonvasPackage height={700} width={800} img={img} fname="stage.png"/>,
    //  </React.StrictMode>,
    document.getElementById(config.canvas)
  );
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
