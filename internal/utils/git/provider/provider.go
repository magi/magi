package provider

import (
    "fmt"
    "github.com/fluxcd/go-git-providers/github"
    "github.com/fluxcd/go-git-providers/gitprovider"
)

type GitProvider string

const (
    GitProviderGitHub GitProvider = "github"
    GitProviderGitLab GitProvider = "gitlab"
)

type Config struct {
    Provider GitProvider
    Hostname string
    Username string
    Token    string
}

func GitProviderBuilder(config Config) (gitprovider.Client, error) {
    var client gitprovider.Client
    var err error
    switch config.Provider {
    case GitProviderGitHub:
        opts := []gitprovider.ClientOption{
            gitprovider.WithOAuth2Token(config.Token),
        }
        if config.Hostname != "" {
            opts = append(opts, gitprovider.WithDomain(config.Hostname))
        }
        if client, err = github.NewClient(opts...); err != nil {
            return nil, err
        }
    default:
        return nil, fmt.Errorf("unsupported Git provider '%s'", config.Provider)
    }
    return client, err
}
