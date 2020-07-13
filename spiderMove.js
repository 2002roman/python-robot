//const Gpio = require('pigpio').Gpio;
//const delay = require('delay');
/*var Motors = {		
		foot1:[
			new Gpio(2,{mode: Gpio.OUTPUT}),
			new Gpio(3,{mode: Gpio.OUTPUT}),
			new Gpio(4,{mode: Gpio.OUTPUT})
		],
		foot2:[
			new Gpio(5,{mode: Gpio.OUTPUT}),
			new Gpio(6,{mode: Gpio.OUTPUT}),
			new Gpio(7,{mode: Gpio.OUTPUT})		
		],
		foot3:[
			new Gpio(8,{mode: Gpio.OUTPUT}),
			new Gpio(9,{mode: Gpio.OUTPUT}),
			new Gpio(10,{mode: Gpio.OUTPUT})
		],
		foot4:[
			new Gpio(11,{mode: Gpio.OUTPUT}),
			new Gpio(12,{mode: Gpio.OUTPUT}),
			new Gpio(13,{mode: Gpio.OUTPUT})
		],
		foot5:[
			new Gpio(14,{mode: Gpio.OUTPUT}),
			new Gpio(15,{mode: Gpio.OUTPUT}),
			new Gpio(16,{mode: Gpio.OUTPUT})
		],
		foot6:[
			new Gpio(17,{mode: Gpio.OUTPUT}),
			new Gpio(18,{mode: Gpio.OUTPUT}),
			new Gpio(19,{mode: Gpio.OUTPUT})
		]
	}
*/
class MoveFoots{

	constructor(footPart1S,footPart2S,footPart3S,servoMaxInPWM,servoMinInPWM,high,servoFlipSpeed,highMax,highMin){
		this.footPart1S = footPart1S;
		this.footPart2S = footPart2S;
		this.footPart3S = footPart3S;
		this.servoMaxInPWM = servoMaxInPWM;
		this.servoMinInPWM = servoMinInPWM;
		this.high = high;
		this.servoFlipSpeed = servoFlipSpeed;
		this.highMin = highMin;
		this.highMax = highMax;
		this.breakCall = false;
	}

	degreeToPulse(degree){
		return Math.floor((((this.servoMaxInPWM-this.servoMinInPWM)/180)*(degree))+this.servoMinInPWM);
	}

	nodeDelayControll(degree){
		return this.servoFlipSpeed/180*degree*1000;
	}

	highControl(high){
		if(high > this.highMin && high < this.highMax){
			if(high == this.footPart3S){
					return {
						Betta : 90,
						Gamma : 90
						}
			}else if(high > this.footPart3S){
					return {
						Gamma : (90+ (180*Math.asin((high-this.footPart3S)/this.footPart2S)/Math.PI)),
						Betta : 180*Math.acos((high-this.footPart3S)/this.footPart2S)/Math.PI
						}
			}else if(high < this.footPart3S){
					return {
						Betta : (90+ (180*Math.asin((this.footPart3S-high)/this.footPart2S)/Math.PI)),
						Gamma : 180*Math.acos((this.footPart3S-high)/this.footPart2S)/Math.PI
					}
			}
			this.high = high;
		}else return {
				err : "Does not fit"
				}
	}


	yAxisStepControl(Alfa){
		var d = 0;
		if(this.high == this.footPart3S){
		/*	
			var e = Math.cos(Alfa * Math.PI / 180);
			var b = Math.pow((this.footPart2S + this.footPart1S / e) - this.footPart1S,2);
			d = Math.sqrt(Math.pow(this.high,2)+b);
		*/
			d = Math.sqrt(Math.pow(this.high,2)+(Math.pow((this.footPart2S + this.footPart1S / (Math.cos(Alfa * Math.PI / 180))) - this.footPart1S,2)));
		}else {
		
			var e = Math.cos(Alfa * Math.PI / 180);
			var t = Math.pow( Math.abs( this.high - this.footPart3S ) , 2 );
			var f = Math.sqrt( Math.pow( this.footPart2S ,2 ) - t );
			var b = Math.pow(((f+this.footPart1S)/e) - this.footPart1S,2);
			d = Math.sqrt(Math.pow(this.high,2)+b);
		
			//d = Math.sqrt(Math.pow(this.high,2)+(Math.pow((Math.sqrt(Math.pow(this.footPart2S,2)-(Math.pow(Math.abs(this.high - this.footPart3S),2)))+this.footPart1S )/ (Math.cos(Alfa * Math.PI / 180)),2) - this.footPart1S));
		console.log(d);	
		
		}
		return {
			A:{
				Alfa : 90+Alfa,
				Betta : (180*Math.acos(this.high/d)/Math.PI)+(180*Math.acos((Math.pow(this.footPart2S,2)+Math.pow(d,2)-Math.pow(this.footPart3S,2))/(2*d*this.footPart2S))/Math.PI),
				Gamma : 180*Math.acos((Math.pow(this.footPart3S,2)+Math.pow(this.footPart2S,2)-Math.pow(d,2))/(2*this.footPart2S*this.footPart3S))/Math.PI
			},
			B:{
				Alfa : 90-Alfa,
				Betta : (180*Math.acos(this.high/d)/Math.PI)+(180*Math.acos((Math.pow(this.footPart2S,2)+Math.pow(d,2)-Math.pow(this.footPart3S,2))/(2*d*this.footPart2S))/Math.PI),
				Gamma : 180*Math.acos((Math.pow(this.footPart3S,2)+Math.pow(this.footPart2S,2)-Math.pow(d,2))/(2*this.footPart2S*this.footPart3S))/Math.PI	
			}
		}
	}

	xAxisStepControl(d){
		var sForA = 0;
		var sForB = 0;
		if(this.high == this.footPart3S){
			sForA = Math.sqrt(Math.pow(this.footPart2S + d,2)+Math.pow(this.high,2));
			sForB = Math.sqrt(Math.pow(this.footPart2S - d,2)+Math.pow(this.high,2));
		}else {
			sForA = Math.sqrt(Math.sqrt(Math.pow(this.footPart2S,2)-(Math.pow(Math.abs(this.high - this.footPart3S),2)))+Math.pow(this.high,2)+d);
			sForB = Math.sqrt(Math.sqrt(Math.pow(this.footPart2S,2)-(Math.pow(Math.abs(this.high - this.footPart3S),2)))+Math.pow(this.high,2)-d);	
		}
		return {
			A:{
				Alfa : 90,
				Betta : (180*Math.acos(this.high/sForA)/Math.PI)+(180*Math.acos((Math.pow(this.footPart2S,2)+Math.pow(sForA,2)-Math.pow(this.footPart3S,2))/(2*sForA*this.footPart2S))/Math.PI),
				Gamma : 180*Math.acos((Math.pow(this.footPart3S,2)+Math.pow(this.footPart2S,2)-Math.pow(sForA,2))/(2*this.footPart2S*this.footPart3S))/Math.PI
			},
			B:{
				Alfa : 90,
				Betta : (180*Math.acos(this.high/sForB)/Math.PI)+(180*Math.acos((Math.pow(this.footPart2S,2)+Math.pow(sForB,2)-Math.pow(this.footPart3S,2))/(2*sForB*this.footPart2S))/Math.PI),
				Gamma : 180*Math.acos((Math.pow(this.footPart3S,2)+Math.pow(this.footPart2S,2)-Math.pow(sForB,2))/(2*this.footPart2S*this.footPart3S))/Math.PI
			}
		}
	}


/*	async foot1(caseWord,objInfo){
		switch(caseWord){
				case "step": 
						while(!this.breakCall){
							Motors.foot1[1].servoWrite(this.servoMinInPWM);
							await delay(objInfo.delayTime);
							switch(objInfo.direction){
								case "back" :
									Motors.foot1[2].servoWrite(this.degreeToPulse(90-objInfo.step.Alfa));
								break;
								case "front" :
									Motors.foot1[2].servoWrite(this.degreeToPulse(90+objInfo.step.Alfa));
								break;
								default :
									Motors.foot1[2].servoWrite(this.degreeToPulse(90+objInfo.step.Alfa));
							}
							Motors.foot1[1].servoWrite(this.degreeToPulse(objInfo.step.Betta));	
							Motors.foot1[0].servoWrite(this.degreeToPulse(objInfo.step.Gamma));
							await delay(objInfo.delayTime);
							Motors.foot1[2].servoWrite(this.degreeToPulse(90));
							Motors.foot1[1].servoWrite(this.degreeToPulse((objInfo.zeroLevel.Betta)));	
							Motors.foot1[0].servoWrite(this.degreeToPulse(objInfo.zeroLevel.Gamma));
							await delay(objInfo.delayTime);
						}
				break;	
				case "attribution":
					while(!this.breakCall){
						Motors.foot1[0].servoWrite(this.degreeToPulse(objInfo.Alfa));
						Motors.foot1[1].servoWrite(this.degreeToPulse(objInfo.Betta));
						Motors.foot1[2].servoWrite(this.degreeToPulse(objInfo.Gamma));
					}
				break;
		}
	}*/
	
	async forward(){
		var objInfo = {
			zeroLevel : this.highControl(this.high),
			step : this.yAxisStepControl(20),
			delayTime : 1000
		}
		console.log(objInfo)
	}

	async start(){
		var objInfo = this.highControl(this.high);
		this.foot1("attribution",objInfo);
	}

	async off(){
		var objInfo = this.highControl(this.highMin);
		this.foot1("attribution",objInfo);
	}
	
}
 //footPart2S,footPart3S,servoMaxInPWM,servoMinInPWM,high,servoFlipSpeed,highMax,highMin
 var spiderTest = new MoveFoots(2.5,5.5,8,2400,600,10,0.36,15,5);
 spiderTest.forward();