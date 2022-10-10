package db

import (
    "context"
    "errors"
    "fmt"
    "github/basefas/magi/internal/utils/logger"
    "go.uber.org/zap"
    gormLogger "gorm.io/gorm/logger"
    "gorm.io/gorm/utils"
    "strings"
    "time"
)

type LogConfig struct {
    SlowThreshold             time.Duration
    LogLevel                  gormLogger.LogLevel
    IgnoreRecordNotFoundError bool
}

type Writer interface {
    Printf(string, ...any)
}

func NewDBLogger(writer Writer, config LogConfig) gormLogger.Interface {
    return &dbLogger{
        Writer:    writer,
        LogConfig: config,
    }
}

type dbLogger struct {
    Writer
    LogConfig
}

func (l *dbLogger) LogMode(level gormLogger.LogLevel) gormLogger.Interface {
    newLogger := *l
    newLogger.LogLevel = level
    return &newLogger
}

func (l *dbLogger) Info(ctx context.Context, msg string, data ...any) {
    if l.LogLevel >= gormLogger.Info {
        logger.Infof("DB",
            zap.Any("data", fmt.Sprintf(msg, append([]any{}, data...)...)),
            zap.Any("src", utils.FileWithLineNum()),
        )
    }
}

func (l *dbLogger) Warn(ctx context.Context, msg string, data ...any) {
    if l.LogLevel >= gormLogger.Warn {
        logger.Warnf("DB",
            zap.Any("data", fmt.Sprintf(msg, append([]any{}, data...)...)),
            zap.Any("src", utils.FileWithLineNum()),
        )
    }
}

func (l *dbLogger) Error(ctx context.Context, msg string, data ...any) {
    if l.LogLevel >= gormLogger.Error {
        errData := fmt.Sprintf(msg, append([]any{}, data...)...)
        if !strings.Contains(errData, "Error 1049") {
            logger.ErrorF("DB",
                zap.Any("data", errData),
                zap.Any("src", utils.FileWithLineNum()),
            )
        }
    }
}

func (l *dbLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
    if l.LogLevel <= gormLogger.Silent {
        return
    }

    elapsed := time.Since(begin)
    switch {
    case err != nil && l.LogLevel >= gormLogger.Error && (!errors.Is(err, gormLogger.ErrRecordNotFound) || !l.IgnoreRecordNotFoundError):
        sql, rows := fc()
        if rows == -1 {
            logger.ErrorF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("error", err),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", "-"),
                zap.Any("sql", sql),
            )
        } else {
            logger.ErrorF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("error", err),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", rows),
                zap.Any("sql", sql),
            )
        }
    case elapsed > l.SlowThreshold && l.SlowThreshold != 0 && l.LogLevel >= gormLogger.Warn:
        sql, rows := fc()
        slowLog := fmt.Sprintf("SLOW SQL >= %v", l.SlowThreshold)
        if rows == -1 {
            logger.WarnF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("slowLog", slowLog),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", "-"),
                zap.Any("sql", sql),
            )
        } else {
            logger.WarnF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("slowLog", slowLog),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", rows),
                zap.Any("sql", sql),
            )
        }
    case l.LogLevel == gormLogger.Info:
        sql, rows := fc()
        if rows == -1 {
            logger.InfoF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", "-"),
                zap.Any("sql", sql),
            )
        } else {
            logger.InfoF("DB",
                zap.Any("src", utils.FileWithLineNum()),
                zap.Any("duration", durationTime(elapsed)),
                zap.Any("rows", rows),
                zap.Any("sql", sql),
            )
        }
    }
}

func durationTime(time time.Duration) any {
    return fmt.Sprintf("%.3fms", float64(time.Nanoseconds())/1e6)
}
