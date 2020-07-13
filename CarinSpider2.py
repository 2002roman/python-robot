import RPi.GPIO as GPIO
import time
import math

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

i = 2
Motors = []

while i < 20:
    GPIO.setup(i, GPIO.OUT)
    Motors.append(GPIO.PWM(i, 50))
    Motors[len(Motors)-1].start(7.5)
    i = i + 1

class createObjForNodes:
	def __init__(self,Alfa,Betta,Gamma):
		self.Alfa = Alfa
		self.Betta = Betta
		self.Gamma = Gamma

class createObjForAB:
	def __init__(self,A,B):
		self.A = A
		self.B = B

class createObjForStep:
	def __init__(self,step,zeroLevel,delayTime):
		self.step = step
		self.zeroLevel = zeroLevel
		self.delayTime = delayTime

class spiderMove:
  	def __init__(self,footPart1S,footPart2S,footPart3S,servoMaxInPWM,servoMinInPWM,high,highMax,highMin):
	    self.footPart1S = footPart1S
            self.footPart2S = footPart2S
            self.footPart3S = footPart3S
            self.servoMaxInPWM = servoMaxInPWM
            self.servoMinInPWM = servoMinInPWM
            self.high = high
            self.highMax = highMax
            self.highMin = highMin
            self.breakCall = True
   
	def degreeToPulse(self,degree):
		return (((self.servoMaxInPWM-self.servoMinInPWM)/180)*(degree))+self.servoMinInPWM

	def nodeDelayControll(self,degree):
		return self.servoFlipSpeed/180*degree*1000

	def mirrorCheck(self,mirrorProperty,degree):
			if mirrorProperty: 
				return (180-degree)
			else:
				return degree

	def highControl(self,high):
		if high > self.highMin and high < self.highMax:
			if high == self.footPart3S:
					return createObjForNodes(90,90,90)
			elif high > self.footPart3S:
						Alfa = 90
						Gamma = (90+ (180*math.asin((high-self.footPart3S)/self.footPart2S)/math.pi))
						Betta = 180-(180*math.acos((high-self.footPart3S)/self.footPart2S)/math.pi)
						return createObjForNodes(Alfa,Betta,Gamma)
			elif high < self.footPart3S:
						Alfa = 90
						Betta = (90- (180*math.asin((self.footPart3S-high)/self.footPart2S)/math.pi))
						Gamma = 180*math.acos((self.footPart3S-high)/self.footPart2S)/math.pi
						return createObjForNodes(Alfa,Betta,Gamma)
			self.high = high
		else:
			self.high = self.footPart3S
			return createObj(90,90,90)
	
	def yAxisStepControl(self,Node):
		d = 0
		if self.high == self.footPart3S:
			e = math.cos(Node * math.pi / 180)
			b = math.pow((self.footPart2S + self.footPart1S / e) - self.footPart1S,2)
			d = math.sqrt(math.pow(self.high,2)+b)
		else:
			e = math.cos(Node * math.pi / 180)
			t = math.pow( math.fabs( self.high - self.footPart3S ) , 2 )
			f = math.sqrt( math.pow( self.footPart2S ,2 ) - t )
			b = math.pow(((f+self.footPart1S)/e) - self.footPart1S,2)
			d = math.sqrt(math.pow(self.high,2)+b)
		
		Alfa = 90+Node
		Betta = 180-(180*math.acos(self.high/d)/math.pi)+(180*math.acos((math.pow(self.footPart2S,2)+math.pow(d,2)-math.pow(self.footPart3S,2))/(2*d*self.footPart2S))/math.pi)
		Gamma = 180*math.acos((math.pow(self.footPart3S,2)+math.pow(self.footPart2S,2)-math.pow(d,2))/(2*self.footPart2S*self.footPart3S))/math.pi
		A = createObjForNodes(Alfa,Betta,Gamma)
		Alfa = 90-Node
		B = createObjForNodes(Alfa,Betta,Gamma)
		return createObjForAB(A,B)

	def xAxisStepControl(self,d):
		sForA = 0
		sForB = 0
		if self.high == self.footPart3S:
			sForA = math.sqrt(math.pow(self.footPart2S + d,2)+math.pow(self.high,2))
			sForB = math.sqrt(math.pow(self.footPart2S - d,2)+math.pow(self.high,2))
		else:
			sForA = math.sqrt(math.sqrt(math.pow(self.footPart2S,2)-(math.pow(math.fabs(self.high - self.footPart3S),2)))+math.pow(self.high,2)+d)
			sForB = math.sqrt(math.sqrt(math.pow(self.footPart2S,2)-(math.pow(math.abs(self.high - self.footPart3S),2)))+math.pow(self.high,2)-d)
		Alfa = 90
		BettaA = 180-(180*math.acos(self.high/sForA)/math.pi)+(180*math.acos((math.pow(self.footPart2S,2)+math.pow(sForA,2)-math.pow(self.footPart3S,2))/(2*sForA*self.footPart2S))/math.pi)
		GammaA = 180*math.acos((math.pow(self.footPart3S,2)+math.pow(self.footPart2S,2)-math.pow(sForA,2))/(2*self.footPart2S*self.footPart3S))/math.pi
		A = createObjForNodes(Alfa,BettaA,GammaA)
		Alfa = 90
		BettaB = 180-(180*math.acos(self.high/sForB)/math.pi)+(180*math.acos((math.pow(self.footPart2S,2)+math.pow(sForB,2)-math.pow(self.footPart3S,2))/(2*sForB*self.footPart2S))/math.pi)
		GammaB = 180*math.acos((math.pow(self.footPart3S,2)+math.pow(self.footPart2S,2)-math.pow(sForB,2))/(2*self.footPart2S*self.footPart3S))/math.pi
		B = createObjForNodes(Alfa,BettaB,GammaB)
		return createObjForAB(A,B)

	def attribution(self,footNum,objInfo,mirrorProperty):
		Motors[(footNum-1)*3+2].ChangeDutyCycle(self.degreeToPulse(90))
		Motors[(footNum-1)*3+1].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.Betta)))
		Motors[(footNum-1)*3+0].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.Gamma)))

	def forward(self):
		zeroLevel = self.highControl(self.high)
		stepA  = self.yAxisStepControl(30).A
		delayTime = 1000
		stepB = self.yAxisStepControl(30).B

		objInfoForA = createObjForStep(stepA,zeroLevel,delayTime)
		objInfoForB = createObjForStep(stepB,zeroLevel,delayTime)
		self.footStep(1,objInfoForA,True)
		self.footStep(3,objInfoForA,False)
		self.footStep(5,objInfoForB,True)
		time.sleep(objInfo.delayTime*2)
		self.footStep(2,objInfoForA,False)
		self.footStep(4,objInfoForB,False)
		self.footStep(6,objInfoForB,True)

	def start(self):
		objInfo = self.highControl(10)
		
		while self.breakCall :
			
			self.attribution(1,objInfo,True)
			self.attribution(2,objInfo,False)
			self.attribution(3,objInfo,False)
			self.attribution(4,objInfo,False)
			self.attribution(5,objInfo,True)
			self.attribution(6,objInfo,True)
	

	def footStep(self,footNum,objInfo,mirrorProperty):
		while self.breakCall :
			Motors[(footNum-1)*3+1].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,0)))
			time.sleep(objInfo.delayTime)
			Motors[(footNum-1)*3+2].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.step.Alfa)))
			Motors[(footNum-1)*3+1].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.step.Betta)))	
			Motors[(footNum-1)*3].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.step.Gamma)))
			time.sleep(objInfo.delayTime)
			Motors[(footNum-1)*3+2].ChangeDutyCycle(self.degreeToPulse(90))
			Motors[(footNum-1)*3+1].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.zeroLevel.Betta)))	
			Motors[(footNum-1)*3].ChangeDutyCycle(self.degreeToPulse(self.mirrorCheck(mirrorProperty,objInfo.zeroLevel.Gamma)))
			time.sleep(objInfo.delayTime)

spiderTest = spiderMove(2.5,5.5,8,2.5,12.5,10,15,5)
spiderTest.forward()
