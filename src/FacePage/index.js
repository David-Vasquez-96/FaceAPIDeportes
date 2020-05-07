import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {connect } from "react-redux";
import mapStateToProps from './mapStateToProps';
import mapDispatchToProps from './mapDispatchToProps';
import Camera from './Camera'; 
import Canva from './Canva'; 
import * as faceapi from 'face-api.js';
import Button from '@material-ui/core/Button';

class FacePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            controller:'game',
            loading: false,
            authorized:false,
            checkAutorization:true,
            positionIndex:0,
        }
        this.setVideoHandler = this.setVideoHandler.bind(this);
        this.isModelLoaded =  this.isModelLoaded.bind(this);
    }
    filtro1(){
        console.log("filtro 1")
    }

    async setVideoHandler(){
        if (this.isModelLoaded()!==undefined){
            try{
                let result= await faceapi.detectSingleFace(this.props.video.current, this.props.detector_options).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
                let predictedAges = [];
                if (result!==undefined){
                    console.log("face detected",result);
                    const dims = faceapi.matchDimensions(this.props.canvas.current, this.props.video.current, true);
                    const resizedResult = faceapi.resizeResults(result, dims);
                    // faceapi.draw.drawDetections(this.props.canvas.current, resizedResult);
                    // faceapi.draw.drawFaceLandmarks(this.props.canvas.current, resizedResult);
                    // faceapi.draw.drawFaceExpressions(this.props.canvas.current,resizedResult);
                    // faceapi.draw.drawDetections(this.props.canvas.current,resizedResult);
                    console.log("detectando => ", resizedResult)


                    // const age = resizedResult.age;
                    // const interpolatedAge = interpolateAgePredictions(age);
                    // // const gender = `genero ${resizedResult.gender}`;
                    // const expressions = resizedResult.expressions;
                    // const maxValue = Math.max(...Object.values(expressions));
                    // const emotion = Object.keys(expressions).filter(
                    //     item => expressions[item] === maxValue
                    //   );
                    //   document.getElementById("age").innerText = `Age - ${interpolatedAge}`;
                    //   document.getElementById("gender").innerText = `Gender - ${gender}`;
                    //   document.getElementById("emotion").innerText = `Emotion - ${emotion[0]}`;

                    //   function interpolateAgePredictions(age) {
                    //     predictedAges = [age].concat(predictedAges).slice(0, 30);
                    //     const avgPredictedAge =
                    //       predictedAges.reduce((total, a) => total + a) / predictedAges.length;
                    //     return avgPredictedAge;
                    //   }
                    //   const emotionPro = `Emocion ${emotion}`;
                    //   const edadPro = `Edad ${Math.trunc(interpolatedAge)}`;

                 
                   
                    
                    //ADD CANVAS
                    const currentCanvas = ReactDOM.findDOMNode(this.props.canvas.current);
                    var canvasElement = currentCanvas.getContext("2d");
                    //ctx.lineTo(x,y);
                    //ctx.stroke();
                    canvasElement.fillStyle='white';


                    //imagen 
                    let base_image = new Image();
                    base_image.src = 'https://library.kissclipart.com/20180904/ssq/kissclipart-champions-league-vector-clipart-afc-champions-leag-367e5593759d8d5b.jpg';
                    base_image.onload = function(){
                        canvasElement.drawImage(base_image, result.landmarks.positions[0].x-27, 
                                result.landmarks.positions[0].y+135,70,70);
                    }
                    
                    let image_logo_fcb = new Image();
                    image_logo_fcb.src = 'https://i.pinimg.com/originals/20/17/39/201739f9b29be8dcd9da06d52e4f8bca.png';
                    image_logo_fcb.onload = function(){
                        canvasElement.drawImage(image_logo_fcb, result.landmarks.positions[13].x+15, 
                                result.landmarks.positions[13].y+80,80,50);
                    }
                    let image_ball_right = new Image();
                    image_ball_right.src = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Soccerball_shade.svg';
                    image_ball_right.onload = function(){
                        canvasElement.drawImage(image_ball_right, result.landmarks.positions[1].x+10, 
                                result.landmarks.positions[1].y-13,40,40);
                    }
                    let image_ball_left = new Image();
                    image_ball_left.src = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Soccerball_shade.svg';
                    image_ball_left.onload = function(){
                        canvasElement.drawImage(image_ball_left, result.landmarks.positions[15].x-40, 
                                result.landmarks.positions[15].y-13,40,40);
                    }
                        



                    //ctx.fillRect(result.alignedRect.box.x, result.alignedRect.box.y, 100, 50);
                    // jaw 0-16  left eyebrow  17-21 right eyebrow  22-26  nose 27-35  left eye 36-41  right eye 42-47 and mouth 48-67
                     //recuadro del indice 
                    canvasElement.fillRect(result.landmarks.positions[this.state.positionIndex].x,
                                result.landmarks.positions[this.state.positionIndex].y, 
                                10, 10);
                   
                    canvasElement.closePath();
                }
            }catch(exception){
                console.log(exception);
            }
        }
        setTimeout(() => this.setVideoHandler());
    }

    isModelLoaded(){
        if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1){
            return faceapi.nets.ssdMobilenetv1.params;
        } 
        if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) {
            return faceapi.nets.tinyFaceDetector.params;
        }
    }

    
    async componentDidMount() {
        console.log("height: "+window.screen.height+", width: "+window.screen.width);
        
        this.setDetectorOptions();
        this.props.SET_VIDEO_HANDLER_IN_GAME_FACENET(this.setVideoHandler);
        
        let modelFolder="/models";
        try{
            await faceapi.loadFaceLandmarkModel(modelFolder);
            //cargar modelo de edad y genero 
            await faceapi.nets.ageGenderNet.loadFromUri(modelFolder);
            //cargar expresiones
            await faceapi.nets.faceExpressionNet.loadFromUri(modelFolder);

            if (this.props.selected_face_detector === this.props.SSD_MOBILENETV1){
                await faceapi.nets.ssdMobilenetv1.loadFromUri(modelFolder);
            }
                
            if (this.props.selected_face_detector === this.props.TINY_FACE_DETECTOR) {
                await faceapi.nets.tinyFaceDetector.load(modelFolder);
            }
        }catch(exception){
            console.log("exception",exception);
        }        
    }

    setDetectorOptions() {
        let minConfidence = this.props.min_confidence,
            inputSize= this.props.input_size,
            scoreThreshold= this.props.score_threshold;

        let options= this.props.selected_face_detector === this.props.SSD_MOBILENETV1
          ? new faceapi.SsdMobilenetv1Options({ minConfidence })
          : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
        this.props.SET_DETECTOR_OPTIONS_IN_GAME_FACENET(options);
    }
 
    render() {
        return (
            <div>
                <Camera/>
                <Canva/>

                <input type="number" 
                    style={{marginLeft:1000}} 
                    value={this.state.positionIndex} 
                    onChange={(event)=>{this.setState({positionIndex: event.target.value})}}/>       

                <br/>
                <Button variant="contained" color="secondary" onClick={this.filtro1}> Filtro 1</Button>     
                <Button variant="contained" color="secondary"> Filtro 2</Button>     
                <Button variant="contained" color="secondary"> Filtro 3</Button>     
                <Button variant="contained" color="secondary"> Filtro 4</Button>     
                <Button variant="contained" color="secondary"> Filtro 5</Button>     
                <Button variant="contained" color="secondary"> Filtro 6</Button>     
                <Button variant="contained" color="secondary"> Filtro 7</Button>     
                <Button variant="contained" color="secondary"> Filtro 8</Button>     
                <Button variant="contained" color="secondary"> Filtro 9</Button>     
                <Button variant="contained" color="secondary"> Filtro 10</Button>     
                <Button variant="contained" color="secondary"> Filtro 11</Button>     
                <Button variant="contained" color="secondary"> Filtro 12</Button>     
                <Button variant="contained" color="secondary"> Filtro 13</Button>     
                <Button variant="contained" color="secondary"> Filtro 14</Button>     
                <Button variant="contained" color="secondary"> Filtro 15</Button>     
                
            </div>            
        )
    }
}
 
export default connect(mapStateToProps, mapDispatchToProps)(FacePage);