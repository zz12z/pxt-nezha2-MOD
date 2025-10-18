//% color=#ff0011 icon="\uf06d" block="TestNezha" blockId="testNezha"
namespace testNezha {
    
    export enum MotorPostion {
        //%block="M1"
        M1 = 1,
        //%block="M2"
        M2 = 2,
        //%block="M3"
        M3 = 3,
        //%block="M4"
        M4 = 4
    }

    export enum ServoMotionMode {
        //%block="shortest path"
        ShortPath = 1,
        //%block="clockwise"
        CW = 2,
        //%block="counterclockwise"
        CCW = 3
    }

    export enum DelayMode {
        //%block="automatic delay"
        AutoDelayStatus = 1,
        //%block="no delay"
        NoDelay = 0
    }

    export enum SportsMode {
        //%block="turns"
        Circle = 1,
        //%block="degrees"
        Degree = 2,
        //%block="seconds"
        Second = 3
    }

    let i2cAddr: number = 0x10;
    let servoSpeedGlobal = 900;
    let relativeAngularArr = [0, 0, 0, 0];

    function delayMs(ms: number): void {
        let time = input.runningTime() + ms;
        while (time >= input.runningTime()) {
        }
    }

    function motorDelay(value: number, motorFunction: SportsMode) {
        let delayTime = 0;
        if (value == 0 || servoSpeedGlobal == 0) {
            return;
        } else if (motorFunction == SportsMode.Circle) {
            delayTime = value * 360000.0 / servoSpeedGlobal + 500;
        } else if (motorFunction == SportsMode.Second) {
            delayTime = (value * 1000);
        } else if (motorFunction == SportsMode.Degree) {
            delayTime = value * 1000.0 / servoSpeedGlobal + 500;
        }
        basic.pause(delayTime);
    }

    function setServoSpeed(speed: number): void {
        if (speed < 0) speed = 0;
        speed *= 9;
        servoSpeedGlobal = speed;
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x77;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = 0x00;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function moveToAbsAngle(motor: MotorPostion, turnMode: ServoMotionMode, angle: number, isDelay: DelayMode): void {
        while (angle < 0) {
            angle += 360;
        }
        angle %= 360;
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor;
        buf[3] = 0x00;
        buf[4] = 0x5D;
        buf[5] = (angle >> 8) & 0XFF;
        buf[6] = turnMode;
        buf[7] = (angle >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4);
        if (isDelay) {
            motorDelay(0.5, SportsMode.Second);
        }
    }

    //% blockId=test_reset_with_speed
    //% block="reset motor $motor to zero at speed $speed"
    //% motor.defl=MotorPostion.M1
    //% speed.min=1 speed.max=100 speed.defl=100
    //% weight=100
    export function resetWithSpeed(motor: MotorPostion, speed: number): void {
        if (speed < 1) {
            speed = 1;
        } else if (speed > 100) {
            speed = 100;
        }
        
        setServoSpeed(speed);
        moveToAbsAngle(motor, ServoMotionMode.ShortPath, 0, DelayMode.AutoDelayStatus);
        relativeAngularArr[motor - 1] = 0;
    }
}
