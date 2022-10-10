package git

import (
    "context"
    "github.com/fluxcd/go-git-providers/gitprovider"
    "github/basefas/magi/internal/utils/git/provider"
)

func FileClient() (gitprovider.FileClient, error) {
    config := GetGitConfig()
    providerClient, err := GetClient()
    if err != nil {
        return nil, err
    }

    switch config.Personal {
    case true:
        ref, err := gitprovider.ParseUserRepositoryURL(config.Repo)
        if err != nil {
            return nil, err
        }
        repo, err := providerClient.UserRepositories().Get(context.Background(), *ref)
        if err != nil {
            return nil, err
        }
        return repo.Files(), nil
    case false:
        ref, err := gitprovider.ParseOrgRepositoryURL(config.Repo)
        if err != nil {
            return nil, err
        }
        repo, err := providerClient.OrgRepositories().Get(context.Background(), *ref)
        if err != nil {
            return nil, err
        }
        return repo.Files(), nil
    default:
        return nil, err
    }
}

func CommitClient() (gitprovider.CommitClient, error) {
    config := GetGitConfig()
    providerClient, err := GetClient()
    if err != nil {
        return nil, err
    }

    switch config.Personal {
    case true:
        ref, err := gitprovider.ParseUserRepositoryURL(config.Repo)
        if err != nil {
            return nil, err
        }
        repo, err := providerClient.UserRepositories().Get(context.Background(), *ref)
        if err != nil {
            return nil, err
        }
        return repo.Commits(), nil
    case false:
        ref, err := gitprovider.ParseOrgRepositoryURL(config.Repo)
        if err != nil {
            return nil, err
        }
        repo, err := providerClient.OrgRepositories().Get(context.Background(), *ref)
        if err != nil {
            return nil, err
        }
        return repo.Commits(), nil
    default:
        return nil, err
    }

}

func GetClient() (gitprovider.Client, error) {
    config := GetGitConfig()
    var providerCfg provider.Config

    switch config.Type {
    case TypeGitHub:
        providerCfg = provider.Config{
            Provider: provider.GitProviderGitHub,
            Hostname: config.Hostname,
            Token:    config.Token,
        }
    }

    return provider.GitProviderBuilder(providerCfg)
}
