package logger

import (
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
)

var log *zap.Logger

func newMagiLogger() *zap.Logger {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder
	encoder := zapcore.NewJSONEncoder(encoderConfig)
	writer := zapcore.AddSync(os.Stdout)
	level := getLogLevel()

	core := zapcore.NewCore(encoder, writer, level)
	development := zap.Development()
	caller := zap.AddCaller()
	skip := zap.AddCallerSkip(1)
	zapLog := zap.New(core, development, caller, skip)

	defer zapLog.Sync()
	return zapLog
}

func Init() {
	log = newMagiLogger()
}

func Debug(msg string) {
	log.Sugar().Debug(msg)
}

func Debugf(msg string, args ...any) {
	log.Sugar().Debugf(msg, args...)
}

func DebugF(msg string, fields ...zap.Field) {
	log.Debug(msg, fields...)
}

func Info(msg string) {
	log.Sugar().Info(msg)
}

func Infof(msg string, args ...any) {
	log.Sugar().Infof(msg, args...)
}

func InfoF(msg string, fields ...zap.Field) {
	log.Info(msg, fields...)
}

func Warn(msg string) {
	log.Sugar().Warn(msg)
}

func Warnf(msg string, args ...any) {
	log.Sugar().Warnf(msg, args...)
}

func WarnF(msg string, fields ...zap.Field) {
	log.Warn(msg, fields...)
}

func Error(msg string) {
	log.Sugar().Error(msg)
}

func Errorf(msg string, args ...any) {
	log.Sugar().Errorf(msg, args...)
}

func ErrorF(msg string, fields ...zap.Field) {
	log.Error(msg, fields...)
}

func Panic(msg string) {
	log.Sugar().Panic(msg)
}

func Panicf(msg string, args ...any) {
	log.Sugar().Panicf(msg, args...)
}

func PanicF(msg string, fields ...zap.Field) {
	log.Panic(msg, fields...)
}

func getLogLevel() zapcore.Level {
	level := viper.GetString("app.logLevel")
	switch level {
	case "panic":
		return zapcore.PanicLevel
	case "error":
		return zapcore.ErrorLevel
	case "warn":
		return zapcore.WarnLevel
	case "info":
		return zapcore.InfoLevel
	case "debug":
		return zapcore.DebugLevel
	default:
		return zapcore.DebugLevel
	}
}
