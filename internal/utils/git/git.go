package git

import (
    "context"
    "github.com/fluxcd/go-git-providers/gitprovider"
    "github.com/spf13/viper"
    "strings"
)

type GitType string

const (
    TypeGitHub GitType = "github"
    TypeGitLab GitType = "gitlab"
)

type Config struct {
    Type     GitType
    Hostname string
    Repo     string
    Username string
    Token    string
    Personal bool
    Private  bool
    Branch   string
}

type CommitFile struct {
    Path    *string `json:"path"`
    Content *string `json:"content"`
}

func GetGitConfig() *Config {
    return &Config{
        Type:     GitType(viper.GetString("git.type")),
        Hostname: viper.GetString("git.hostname"),
        Repo:     viper.GetString("git.repo"),
        Username: viper.GetString("git.username"),
        Token:    viper.GetString("git.token"),
        Personal: viper.GetBool("git.personal"),
        Private:  viper.GetBool("git.private"),
        Branch:   viper.GetString("git.branch"),
    }
}

func Get(path string) (string, error) {
    c, err := FileClient()
    if err != nil {
        return "", err
    }
    file, err := c.GetContent(context.Background(), path, GetGitConfig().Branch)
    if err != nil {
        return "", err
    }
    return *file, nil
}

func Commit(files []CommitFile) (gitprovider.Commit, error) {
    c, err := CommitClient()
    if err != nil {
        return nil, err
    }
    commitMsg := "Magi commit."
    commitFiles := make([]gitprovider.CommitFile, 0)
    for _, file := range files {
        commitFiles = append(commitFiles, gitprovider.CommitFile{Path: file.Path, Content: file.Content})
    }
    commit, err := c.Create(context.Background(), GetGitConfig().Branch, commitMsg, commitFiles)
    return commit, err
}

func CommitWithShortSHA(files []CommitFile) (shortSha string, err error) {
    commit, err := Commit(files)
    if err != nil {
        return "", err
    }
    shortSha = commit.Get().Sha[0:7]
    return shortSha, nil
}

func HasContent(path string) (bool, error) {
    _, err := Get(path)
    if err != nil {
        if strings.Contains(err.Error(), "404 Not Found") {
            return false, nil
        }
        return false, err
    }
    return true, nil
}
