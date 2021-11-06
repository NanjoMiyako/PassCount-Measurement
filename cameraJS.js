
function startVideo() {
    console.info('入出力デバイスを確認してビデオを開始するよ！');

    Promise.resolve()
        .then(function () {
            return navigator.mediaDevices.enumerateDevices();
        })
        .then(function (mediaDeviceInfoList) {
            console.log('使える入出力デバイスs->', mediaDeviceInfoList);

            var videoDevices = mediaDeviceInfoList.filter(function (deviceInfo) {
                return deviceInfo.kind == 'videoinput';
            });
            if (videoDevices.length < 1) {
                throw new Error('ビデオの入力デバイスがない、、、、、。');
            }

            return navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    deviceId: videoDevices[0].deviceId
                }
            });
        })
        .then(function (mediaStream) {
            console.log('取得したMediaStream->', mediaStream);
            videoStreamInUse = mediaStream;
            //document.querySelector('video').src = window.URL.createObjectURL(mediaStream);
            // 対応していればこっちの方が良い
             document.querySelector('video').srcObject = mediaStream;


        })
        .catch(function (error) {
            console.error('ビデオの設定に失敗、、、、', error);
        });
}

var canvas1 = document.getElementById("canvas1");
canvas1.addEventListener('click', drawRectAtClickedPos, false);

var LeftUpX = 0
var LeftUpY = 0
var RightDownX = 0
var RightDownY = 0

var CurrentX = 0
var CurrentY = 0


var KensyutuRect1 = new Rectangle(0,0,0,0)
var KensyutuRect2 = new Rectangle(0,0,0,0)
var continueFlg = false;


//ビデオ停止！ボタンで走るやつ
function RegistKensyutuRect1(){
	KensyutuRect1 = new Rectangle(LeftUpX, LeftUpY, RightDownX, RightDownY);
}
function RegistKensyutuRect2(){
	KensyutuRect2 = new Rectangle(LeftUpX, LeftUpY, RightDownX, RightDownY);
}
function stopVideo() {
    console.info('ビデオを止めるよ！');

    videoStreamInUse.getVideoTracks()[0].stop();

    if (videoStreamInUse.active) {
        console.error('停止できかた、、、', videoStreamInUse);
    } else {
        console.log('停止できたよ！', videoStreamInUse);
    }
}

function snapshot() {
    console.info('10秒後スナップショットをとるよ！');

	sleepAndExecuteFunc(10, snapshotExecute);
}

var firstFlg = true;

var g_videoElement = document.querySelector('video');
var g_canvasElement1 = document.getElementById("canvas1");
var g_canvasElement2 = document.getElementById("canvas2");
var g_canvasElement3 = document.getElementById("canvas3");

var g_Width = g_videoElement.width;
var g_Height = g_videoElement.height;

function Test2(){
	snapshotExecute()

}

/**
 * canvas 内のクリックした座標に青薄色の四角形を描画する
 */
function drawRectAtClickedPos(ev) {
    var videoElement = document.querySelector('video');
    var canvasElement = document.getElementById("canvas1");
    var ctx = canvasElement.getContext('2d');

/*
 * rectでcanvasの絶対座標位置を取得し、
 * クリック座標であるe.clientX,e.clientYからその分を引く
 * ※クリック座標はdocumentからの位置を返すため
 * ※rectはスクロール量によって値が変わるので、onClick()内でつど定義
 */
var rect = ev.target.getBoundingClientRect();
posX = parseInt(ev.clientX - rect.left);
posY = parseInt(ev.clientY - rect.top);

  
  ctx.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
  
  ctx.fillStyle = "rgb(255,0,0)";
  ctx.fillRect(LeftUpX, LeftUpY, 10,10);
  
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fillRect(RightDownX, RightDownY, 10,10);
  
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.strokeRect(posX, posY, 10,10);
  
  ctx.strokeStyle = "rgb(255, 0, 0)";
  w = KensyutuRect1.right - KensyutuRect1.left
  h = KensyutuRect1.bottom - KensyutuRect1.top
  ctx.strokeRect(KensyutuRect1.left, KensyutuRect1.top, w, h);
  
  ctx.strokeStyle = "rgb(0, 255, 0)";
  w = KensyutuRect2.right - KensyutuRect2.left
  h = KensyutuRect2.bottom - KensyutuRect2.top
  ctx.strokeRect(KensyutuRect2.left, KensyutuRect2.top, w, h);
  
  CurrentX = posX
  CurrentY = posY
     
}

function HidariUeClick(){
	LeftUpX = CurrentX
	LeftUpY = CurrentY
}

function MigiSitaClick(){
	RightDownX = CurrentX
	RightDownY = CurrentY
}



function UnderDiff1(ImageData1, ImageData2){
	var context3 = g_canvasElement3.getContext('2d');
	var out_img = context3.getImageData(0,0, g_videoElement.width, g_videoElement.height);
    
    var pixels1 = ImageData1.data;
    var pixels2 = ImageData2.data;
    var outPixels = out_img.data;
    
    
    var firstY = g_Height * 0.5;
	
	var menseki = (g_Height - firstY) * g_Width;
	var Changed_Count = 0;
	
	// ピクセル単位で操作できる
	var base = 0;
	
	for(var y = 0; y < g_Height; ++y){
		for(var x =0; x<g_Width; ++x){
			base = (y * g_Width + x) * 4;
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
		}
	}
	
	for (var y = firstY; y < g_Height; ++y) {
	  for (var x = 0; x < g_Width; ++x) {
	    base = (y * g_Width + x) * 4;
	    // なんかピクセルに書き込む
	    outPixels[base + 0] = Math.abs(pixels1[base + 0] - pixels2[base + 0]);  // Red
	    outPixels[base + 1] = Math.abs(pixels1[base + 1] - pixels2[base + 1]);  // Green
	    outPixels[base + 2] = Math.abs(pixels1[base + 2] - pixels2[base + 2]);  // Blue
	    outPixels[base + 3] = 255;  // Alpha
	    
	    if(outPixels[base + 0] >= 10 &&
	       outPixels[base + 1] >= 10 &&
	       outPixels[base + 2] >= 10 ){
	         Changed_Count++;
	    }else{
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
	    }
	    
	  }
	}
	
	var retVal = new Object();
	retVal.changeRate = (Changed_Count / menseki) * 100.0;
	retVal.outImageData = out_img;
	
	return retVal;

}

function RectAreaDiff(ImageData1, ImageData2, Rect1){
	var context3 = g_canvasElement3.getContext('2d');	
	var out_img = context3.getImageData(0,0, g_videoElement.width, g_videoElement.height);
    
    var pixels1 = ImageData1.data;
    var pixels2 = ImageData2.data;
    var outPixels = out_img.data;
    
    
    var startX = Rect1.left
    var startY = Rect1.top
    var endX = Rect1.right;
	var endY = Rect1.bottom;
	
	var w1 = Rect1.right - Rect1.left;
	var h1 = Rect1.bottom - Rect1.top;
	
	var menseki = w1 * h1;
	var Changed_Count = 0;
	
	if(menseki == 0){
		menseki = 1.0
	}
	// ピクセル単位で操作できる
	var base = 0;
	
	for(var y = startY; y < endY; ++y){
		for(var x = startX; x<endX; ++x){
			base = (y * g_Width + x) * 4;
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
		}
	}
	
	for (var y = startY; y < endY; ++y) {
	  for (var x = startX; x < endX; ++x) {
	    base = (y * g_Width + x) * 4;
	    // なんかピクセルに書き込む
	    outPixels[base + 0] = Math.abs(pixels1[base + 0] - pixels2[base + 0]);  // Red
	    outPixels[base + 1] = Math.abs(pixels1[base + 1] - pixels2[base + 1]);  // Green
	    outPixels[base + 2] = Math.abs(pixels1[base + 2] - pixels2[base + 2]);  // Blue
	    outPixels[base + 3] = 255;  // Alpha
	    
	    if(outPixels[base + 0] >= 10 &&
	       outPixels[base + 1] >= 10 &&
	       outPixels[base + 2] >= 10 ){
	         Changed_Count++;
	    }else{
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
	    }
	    
	  }
	}
	
	var retVal = new Object();
	retVal.changeRate = (Changed_Count / menseki) * 100.0;
	retVal.outImageData = out_img;
	
	return retVal;

}

function LeftUpperDiff(ImageData1, ImageData2){
	var context3 = g_canvasElement3.getContext('2d');	
	var out_img = context3.getImageData(0,0, g_videoElement.width, g_videoElement.height);
    
    var pixels1 = ImageData1.data;
    var pixels2 = ImageData2.data;
    var outPixels = out_img.data;
    
    
    var endY = g_Height * 0.5;
	var endX = g_Width * 0.5;
	
	var menseki = endY * endX;
	var Changed_Count = 0;
	
	// ピクセル単位で操作できる
	var base = 0;
	
	for(var y = 0; y < g_Height; ++y){
		for(var x =0; x<g_Width; ++x){
			base = (y * g_Width + x) * 4;
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
		}
	}
	
	for (var y = 0; y < endY; ++y) {
	  for (var x = 0; x < endX; ++x) {
	    base = (y * g_Width + x) * 4;
	    // なんかピクセルに書き込む
	    outPixels[base + 0] = Math.abs(pixels1[base + 0] - pixels2[base + 0]);  // Red
	    outPixels[base + 1] = Math.abs(pixels1[base + 1] - pixels2[base + 1]);  // Green
	    outPixels[base + 2] = Math.abs(pixels1[base + 2] - pixels2[base + 2]);  // Blue
	    outPixels[base + 3] = 255;  // Alpha
	    
	    if(outPixels[base + 0] >= 10 &&
	       outPixels[base + 1] >= 10 &&
	       outPixels[base + 2] >= 10 ){
	         Changed_Count++;
	    }else{
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
	    }
	    
	  }
	}
	
	var retVal = new Object();
	retVal.changeRate = (Changed_Count / menseki) * 100.0;
	retVal.outImageData = out_img;
	
	return retVal;


}

function RightUpperDiff(ImageData1, ImageData2){
	var context3 = g_canvasElement3.getContext('2d');
	var out_img = context3.getImageData(0,0, g_videoElement.width, g_videoElement.height);
    
    var pixels1 = ImageData1.data;
    var pixels2 = ImageData2.data;
    var outPixels = out_img.data;
    
    
    var endY = g_Height * 0.5;
	var startX = g_Width * 0.5;
	
	var menseki = endY * (g_Width - startX);
	var Changed_Count = 0;
	
	// ピクセル単位で操作できる
	var base = 0;
	
	for(var y = 0; y < g_Height; ++y){
		for(var x = 0; x<g_Width; ++x){
			base = (y * g_Width + x) * 4;
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
		}
	}
	
	for (var y = 0; y < endY; ++y) {
	  for (var x = startX; x < g_Width; ++x) {
	    base = (y * g_Width + x) * 4;
	    // なんかピクセルに書き込む
	    outPixels[base + 0] = Math.abs(pixels1[base + 0] - pixels2[base + 0]);  // Red
	    outPixels[base + 1] = Math.abs(pixels1[base + 1] - pixels2[base + 1]);  // Green
	    outPixels[base + 2] = Math.abs(pixels1[base + 2] - pixels2[base + 2]);  // Blue
	    outPixels[base + 3] = 255;  // Alpha
	    
	    if(outPixels[base + 0] >= 10 &&
	       outPixels[base + 1] >= 10 &&
	       outPixels[base + 2] >= 10 ){
	         Changed_Count++;
	    }else{
		    outPixels[base + 0] = 0;  // Red
		    outPixels[base + 1] = 0;  // Green
		    outPixels[base + 2] = 0;  // Blue
		    outPixels[base + 3] = 255;  // Alpha
	    }
	    
	  }
	}
	
	var retVal = new Object();
	retVal.changeRate = (Changed_Count / menseki) * 100.0;
	retVal.outImageData = out_img;
	
	return retVal;
}

var g_Count = 0;
var PrevChangeFlg = false;
var d1 = new Date();

const CHANGE_THRE1 = 30.0;
const CHANGE_THRE2 = 30.0;

var ThrowCount = 0;

function StartTest1(){
	continueFlg = true;
	firstFlg = true;
	Test1();
}

//テスト1終了関数
function Test1End(){
	continueFlg = false;
	firstFlg = true;
}

function Test1(){

    //var videoElement = document.querySelector('video');
    //var canvasElement = document.getElementById("canvas2");
    var context1 = g_canvasElement1.getContext('2d');
    var context2 = g_canvasElement2.getContext('2d');
	var context3 = g_canvasElement3.getContext('2d');


    if(firstFlg == false){
    	var img1 = context1.getImageData(0,0, g_videoElement.width, g_videoElement.height);
		var img2 = context2.getImageData(0,0, g_videoElement.width, g_videoElement.height);
 
 		var changeRate2 = document.getElementById("changeRate2");   	
    	outObj1 = RectAreaDiff(img1, img2, KensyutuRect1);
    	if(PrevChangeFlg == true){
    		outObj2 = RectAreaDiff(img1, img2, KensyutuRect2);
			changeRate2.innerHTML = outObj2.changeRate;
			if(outObj2.changeRate >= CHANGE_THRE2){
				d2 = new Date();
				diff = d2.getTime() - d1.getTime();
				if(diff > 1000){//通過スパンタイムは1秒ごと
					ThrowCount++;
					d1 = d2
				}else{
					//カウンタは更新しない
				}
				var throwCountSpan = document.getElementById("ThrowCount1");
				throwCountSpan.innerHTML = ThrowCount
				PrevChangeFlg = false;
				firstFlg = true
			}
    	}
		
		
		var changeRate1 = document.getElementById("changeRate1");
		changeRate1.innerHTML = outObj1.changeRate;
		if(outObj1.changeRate >= CHANGE_THRE1){
			PrevChangeFlg = true;
		}else{
			PrevChangeFlg = false;
		}

				
		g_Count++;
		if(g_Count >= 200){
	    	context1.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
	    	context2.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
			g_Count = 0;
		}
		
		if((g_Count % 5) == 0){//1.0秒ごとに画面更新
			if( (g_Count % 10) == 0){
				context2.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
			}else{
				context1.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
			}
		}
		
		
    	//context1.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
    	//0.1秒ごとに呼び出し
    	if(continueFlg == true){
    		sleepAndExecuteFunc2(1, Test1);
    	}
    	

    }else{
    	
    	firstFlg = false;
    	g_Count = 0
    	context1.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
    	context2.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
    	
    	//0.1秒ごとに呼び出し
    	if(continueFlg == true){
    		sleepAndExecuteFunc2(1, Test1);
    	}
    	
		var throwCountSpan = document.getElementById("ThrowCount1");
		throwCountSpan.innerHTML = ThrowCount
    	

    }
    
	context1.strokeStyle = "rgb(255,255,255)";
	context2.strokeStyle = "rgb(255,255,255)";
	context3.strokeStyle = "rgb(255,255,255)";
	context1.strokeRect(CurrentX, CurrentY, 10,10);
	context2.strokeRect(CurrentX, CurrentY, 10,10);
	context3.strokeRect(CurrentX, CurrentY, 10,10);
    
	context1.strokeStyle = "rgb(255, 0, 0)";
	context2.strokeStyle = "rgb(255, 0, 0)";
	context3.strokeStyle = "rgb(255, 0, 0)";
	w = KensyutuRect1.right - KensyutuRect1.left
	h = KensyutuRect1.bottom - KensyutuRect1.top
	context1.strokeRect(KensyutuRect1.left, KensyutuRect1.top, w, h);
	context2.strokeRect(KensyutuRect1.left, KensyutuRect1.top, w, h);
	context3.strokeRect(KensyutuRect1.left, KensyutuRect1.top, w, h);

	context1.strokeStyle = "rgb(255, 0, 0)";
	context2.strokeStyle = "rgb(255, 0, 0)";
	context3.strokeStyle = "rgb(255, 0, 0)";
	w = KensyutuRect2.right - KensyutuRect2.left
	h = KensyutuRect2.bottom - KensyutuRect2.top
	context1.strokeRect(KensyutuRect2.left, KensyutuRect2.top, w, h);
	context2.strokeRect(KensyutuRect2.left, KensyutuRect2.top, w, h);
	context3.strokeRect(KensyutuRect2.left, KensyutuRect2.top, w, h);
    
    
}

var stTime;
var currentTime;
var myTimer1;
var diffSecond1;
var passedTimeSpan = document.getElementById("PassedTime1");
function StartTimer(){
	var tm = 1000;
	stTime = new Date();
	ThrowCount = 0;
	myTimer1 = setInterval(TickTime, tm);
}
function TickTime(){
	currentTime = new Date();
	
	diffSecond1 = parseInt((currentTime.getTime() - stTime.getTime()) / 1000);

	hour = parseInt(diffSecond1 / 3600);
	min = parseInt((diffSecond1 / 60) % 60);
	sec = diffSecond1 % 60;

	// 数値が1桁の場合、頭に0を付けて2桁で表示する指定
	if(hour < 10) { hour = "0" + hour; }
	if(min < 10) { min = "0" + min; }
	if(sec < 10) { sec = "0" + sec; }

	// フォーマットを指定（不要な行を削除する）
	var timer2 = hour + '時間' + min + '分' + sec + '秒'; // パターン2
	
	passedTimeSpan.innerHTML = timer2
	
}

function EndTimer(){
	clearInterval(myTimer1)
}
function callback1(){
    var context1 = g_canvasElement1.getContext('2d');
    context1.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
}

function callback2(){
    var context2 = g_canvasElement2.getContext('2d');
    context2.drawImage(g_videoElement, 0, 0, g_videoElement.width, g_videoElement.height);
}

function snapshotExecute(){
    var videoElement = document.querySelector('video');
    var canvasElement = document.getElementById("canvas1");
    var context = canvasElement.getContext('2d');

    context.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
    //document.querySelector('img').src = canvasElement.toDataURL('image/png');
    //document.getElementById("img1").src = canvasElement.toDataURL('image/png');
}

function snapshotExecute2(){
    var videoElement = document.querySelector('video');
    var canvasElement = document.getElementById("canvas2");
    var context = canvasElement.getContext('2d');

    context.drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);
}

function Rectangle(x1, y1, x2, y2){
	
	
	if(x1 <= x2){
		this.left = x1
		this.right = x2
	}else{
		this.left = x2
		this.right = x1
	}
	
	if(y1 <= y2){
		this.top = y1
		this.bottom = y2
	}else{
		this.top = y2
		this.bottom = y1
	}
}


function sleepAndExecuteFunc(waitSec, callbackFunc) {
 
  var spanedSec = 0;
 
  var waitFunc = function () {
 
      spanedSec++;
 
      if (spanedSec >= waitSec) {
          if (callbackFunc) callbackFunc();
          return;
      }
 
      clearTimeout(id);
      id = setTimeout(waitFunc, 1000);
  
  };
 
  var id = setTimeout(waitFunc, 1000);
 
}

function sleepAndExecuteFunc2(waitSec, callbackFunc) {
 
  var spanedSec = 0;
 
  var waitFunc = function () {
 
      spanedSec++;
 
      if (spanedSec >= waitSec) {
          if (callbackFunc) callbackFunc();
          return;
      }
 
      clearTimeout(id);
      if(continueFlg == true){
      	id = setTimeout(waitFunc, 100);
      }
  
  };
 
  var id = setTimeout(waitFunc, 100);
 
}

function Test3(){
	
	var tm = 1000;
	setInterval(snapshotExecute2, tm);
}
 